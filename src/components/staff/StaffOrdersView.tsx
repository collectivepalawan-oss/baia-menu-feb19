import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import OrderCard from '@/components/admin/OrderCard';

const STATUSES = ['New', 'Preparing', 'Served', 'Paid'];

const StaffOrdersView = () => {
  const qc = useQueryClient();

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('staff-orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        qc.invalidateQueries({ queryKey: ['orders-staff'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  const { data: orders = [] } = useQuery({
    queryKey: ['orders-staff'],
    queryFn: async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', start.toISOString())
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const [activeStatus, setActiveStatus] = useState('New');

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { New: 0, Preparing: 0, Served: 0, Paid: 0 };
    orders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });
    return counts;
  }, [orders]);

  const filtered = useMemo(() => orders.filter(o => o.status === activeStatus), [orders, activeStatus]);

  const advanceOrder = async (orderId: string, nextStatus: string) => {
    const updateData: any = { status: nextStatus };
    if (nextStatus === 'Closed') updateData.closed_at = new Date().toISOString();
    await supabase.from('orders').update(updateData).eq('id', orderId);
    qc.invalidateQueries({ queryKey: ['orders-staff'] });
    toast.success(`Order → ${nextStatus}`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Status tabs */}
      <div className="flex gap-1 px-4 py-3 overflow-x-auto scrollbar-hide">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setActiveStatus(s)}
            className={`font-display text-xs tracking-wider px-3 min-h-[44px] rounded-md flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeStatus === s
                ? 'bg-gold/20 text-gold border border-gold/40'
                : 'bg-secondary text-cream-dim border border-border'
            }`}
          >
            {s}
            {statusCounts[s] > 0 && (
              <span className={`text-[10px] font-body font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                activeStatus === s ? 'bg-gold text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {statusCounts[s]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {filtered.length === 0 && (
          <p className="font-body text-sm text-cream-dim text-center py-12">No {activeStatus.toLowerCase()} orders</p>
        )}
        {filtered.map(order => (
          <OrderCard key={order.id} order={order} onAdvance={advanceOrder} />
        ))}
      </div>
    </div>
  );
};

export default StaffOrdersView;
