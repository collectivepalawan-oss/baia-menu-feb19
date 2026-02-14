import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/lib/cart';
import { ShoppingBag, Plus, Minus, UtensilsCrossed, ClipboardList } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import CartDrawer from '@/components/CartDrawer';
import StaffOrdersView from '@/components/staff/StaffOrdersView';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
  available: boolean;
  sort_order: number;
}

const MenuPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode') || 'guest';
  const orderType = searchParams.get('orderType') || 'WalkIn';
  const location = searchParams.get('location') || '';
  const isStaff = mode === 'staff';

  const [activeCategory, setActiveCategory] = useState('');
  const [staffTab, setStaffTab] = useState<'menu' | 'orders'>('menu');

  const { data: categories = [] } = useQuery({
    queryKey: ['menu-categories'],
    queryFn: async () => {
      const { data } = await supabase.from('menu_categories').select('*').eq('active', true).order('sort_order');
      return data || [];
    },
  });

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].name);
    }
  }, [categories, activeCategory]);

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [addQuantity, setAddQuantity] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);

  const cart = useCart();

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu_items'],
    queryFn: async () => {
      const { data } = await supabase.from('menu_items').select('*').eq('available', true).order('sort_order');
      return (data || []) as MenuItem[];
    },
  });

  // Count active orders for badge (staff only)
  const { data: activeOrderCount = 0 } = useQuery({
    queryKey: ['active-order-count-staff'],
    enabled: isStaff,
    refetchInterval: 10000,
    queryFn: async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', start.toISOString())
        .in('status', ['New', 'Preparing', 'Served', 'Paid']);
      return count || 0;
    },
  });

  const filteredItems = menuItems.filter(i => i.category === activeCategory);

  const handleAddToCart = () => {
    if (!selectedItem) return;
    for (let i = 0; i < addQuantity; i++) {
      cart.addItem({ id: selectedItem.id, name: selectedItem.name, price: selectedItem.price });
    }
    setSelectedItem(null);
    setAddQuantity(1);
  };

  const showMenu = !isStaff || staffTab === 'menu';

  return (
    <div className={`min-h-screen bg-navy-texture flex flex-col ${isStaff ? 'pb-16' : ''}`}>
      {showMenu ? (
        <>
          {/* Header */}
          <header className="sticky top-0 z-30 bg-navy-deep/95 backdrop-blur-sm border-b border-border">
            <div className="max-w-2xl mx-auto px-4 pt-4 pb-2 flex items-center justify-between">
              <button onClick={() => navigate('/order-type')} className="font-body text-sm text-cream-dim hover:text-foreground transition-colors">
                ← Back
              </button>
              <h1 className="font-display text-lg tracking-[0.15em] text-foreground">BAIA PALAWAN</h1>
              <div className="w-12" />
            </div>

            {/* Category tabs */}
            <div className="relative max-w-2xl mx-auto">
              <div className="px-4 pb-3 flex gap-6 overflow-x-auto scrollbar-hide">
                {categories.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`font-display text-sm tracking-wider whitespace-nowrap pb-1 transition-colors border-b-2 min-h-[44px] ${
                      activeCategory === cat.name
                        ? 'border-gold text-foreground'
                        : 'border-transparent text-cream-dim hover:text-foreground'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-l from-[hsl(var(--navy-deep))] to-transparent" />
            </div>
          </header>

          {/* Menu content */}
          <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-8">
            <h2 className="font-display text-2xl tracking-wider text-foreground mb-8">{activeCategory}</h2>
            <div className="flex flex-col gap-6">
              {filteredItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => { setSelectedItem(item); setAddQuantity(1); }}
                  className="text-left animate-fade-in group"
                  style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'both' }}
                >
                  <div className="flex items-baseline">
                    <span className="font-display text-base md:text-lg text-foreground group-hover:text-gold transition-colors">
                      {item.name}
                    </span>
                    <span className="dotted-leader" />
                    <span className="font-display text-base text-foreground whitespace-nowrap">
                      ₱{item.price.toLocaleString()}
                    </span>
                  </div>
                  {item.description && (
                    <p className="font-body text-sm text-cream-dim mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </main>

          {/* Floating cart button */}
          {cart.count() > 0 && (
            <button
              onClick={() => setCartOpen(true)}
              className={`fixed ${isStaff ? 'bottom-20' : 'bottom-6'} right-6 z-40 w-14 h-14 rounded-full bg-gold text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-body font-bold">
                {cart.count()}
              </span>
            </button>
          )}
        </>
      ) : (
        /* Orders view for staff */
        <div className="flex-1 flex flex-col">
          <div className="sticky top-0 z-30 bg-navy-deep/95 backdrop-blur-sm border-b border-border">
            <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-center">
              <h1 className="font-display text-lg tracking-[0.15em] text-foreground">ORDERS</h1>
            </div>
          </div>
          <StaffOrdersView />
        </div>
      )}

      {/* Item detail modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="bg-card border-border max-w-xs">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground tracking-wider text-center">
              {selectedItem?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="flex flex-col items-center gap-4 pt-2">
              <p className="font-body text-sm text-cream-dim text-center">{selectedItem.description}</p>
              <p className="font-display text-xl text-foreground">₱{selectedItem.price.toLocaleString()}</p>
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setAddQuantity(Math.max(1, addQuantity - 1))}
                  className="w-10 h-10 border border-border rounded-full flex items-center justify-center text-foreground hover:border-gold transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-display text-xl text-foreground w-8 text-center">{addQuantity}</span>
                <button
                  onClick={() => setAddQuantity(addQuantity + 1)}
                  className="w-10 h-10 border border-border rounded-full flex items-center justify-center text-foreground hover:border-gold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <Button onClick={handleAddToCart} className="w-full font-display tracking-wider py-6">
                Add to Order — ₱{(selectedItem.price * addQuantity).toLocaleString()}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cart drawer */}
      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        mode={mode}
        orderType={orderType}
        locationDetail={location}
      />

      {/* Bottom nav bar - staff only */}
      {isStaff && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
          <div className="max-w-2xl mx-auto flex">
            <button
              onClick={() => setStaffTab('menu')}
              className={`flex-1 flex flex-col items-center justify-center min-h-[56px] gap-0.5 transition-colors ${
                staffTab === 'menu' ? 'text-gold' : 'text-cream-dim'
              }`}
            >
              <UtensilsCrossed className="w-5 h-5" />
              <span className="font-body text-[10px] tracking-wider">Menu</span>
            </button>
            <button
              onClick={() => setStaffTab('orders')}
              className={`flex-1 flex flex-col items-center justify-center min-h-[56px] gap-0.5 transition-colors relative ${
                staffTab === 'orders' ? 'text-gold' : 'text-cream-dim'
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="font-body text-[10px] tracking-wider">Orders</span>
              {activeOrderCount > 0 && (
                <span className="absolute top-1.5 right-1/4 bg-destructive text-destructive-foreground text-[10px] font-body font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {activeOrderCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default MenuPage;
