import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const FieldManualModal = ({ open, onClose }: Props) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 overflow-y-auto py-8 px-4">
      <div className="relative w-full max-w-2xl bg-background border border-border rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-display text-lg tracking-wider text-foreground">Field Manual</h2>
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 font-body text-sm text-foreground">

          {/* Welcome */}
          <section className="space-y-2">
            <h3 className="font-display text-base tracking-wider text-foreground">Welcome to the Team</h3>
            <p className="text-muted-foreground">
              This field manual outlines the operational standards and daily procedures for all staff at Baia.
              Please read each section carefully and refer back whenever you need a refresher.
            </p>
          </section>

          {/* General Conduct */}
          <section className="space-y-2">
            <h3 className="font-display text-sm tracking-wider text-foreground uppercase">General Conduct</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Arrive on time and in full uniform before your shift begins.</li>
              <li>Greet every guest with a warm smile and eye contact.</li>
              <li>Use the guest's name when possible after check-in.</li>
              <li>Keep personal mobile use to breaks and away from guest areas.</li>
              <li>Escalate any unresolved guest concern to a supervisor immediately.</li>
            </ul>
          </section>

          {/* Clocking In & Out */}
          <section className="space-y-2">
            <h3 className="font-display text-sm tracking-wider text-foreground uppercase">Clocking In &amp; Out</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Use the Employee Portal to clock in at the start of every shift.</li>
              <li>Clock out before leaving — missed punches delay payroll processing.</li>
              <li>If you forget to clock in or out, notify your supervisor the same day.</li>
              <li>Overtime requires prior approval from management.</li>
            </ul>
          </section>

          {/* Orders & Service */}
          <section className="space-y-2">
            <h3 className="font-display text-sm tracking-wider text-foreground uppercase">Orders &amp; Service</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>All food and beverage orders must be entered in the system before preparation begins.</li>
              <li>Confirm the order with the guest before submitting.</li>
              <li>Mark orders as Served only after delivery is confirmed with the guest.</li>
              <li>Room charges must be attached to the correct room number — double-check before confirming.</li>
              <li>Comped items require a manager's approval.</li>
            </ul>
          </section>

          {/* Housekeeping */}
          <section className="space-y-2">
            <h3 className="font-display text-sm tracking-wider text-foreground uppercase">Housekeeping</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Mark rooms as Clean only after a full inspection — linens, bathroom, minibar, and floor.</li>
              <li>Report damaged fixtures or missing items using the task system immediately.</li>
              <li>Do not enter an occupied room without knocking twice and announcing yourself.</li>
              <li>Lost &amp; found items must be logged and handed to the reception desk the same day.</li>
            </ul>
          </section>

          {/* Reception */}
          <section className="space-y-2">
            <h3 className="font-display text-sm tracking-wider text-foreground uppercase">Reception</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Verify guest ID at check-in before issuing room keys.</li>
              <li>Confirm departure date and any pre-booked experiences at check-in.</li>
              <li>Billing discrepancies must be resolved with the guest before checkout is finalised.</li>
              <li>Keep the front desk clear of personal items at all times.</li>
            </ul>
          </section>

          {/* Safety */}
          <section className="space-y-2">
            <h3 className="font-display text-sm tracking-wider text-foreground uppercase">Safety &amp; Emergencies</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Know the location of all fire exits, fire extinguishers, and first-aid kits on your floor.</li>
              <li>In case of fire: alert guests, activate the nearest alarm, call emergency services, then evacuate.</li>
              <li>Workplace accidents must be reported to management and logged before the end of the shift.</li>
              <li>Never attempt to handle a situation involving guest violence alone — call for backup.</li>
            </ul>
          </section>

          {/* Communication */}
          <section className="space-y-2">
            <h3 className="font-display text-sm tracking-wider text-foreground uppercase">Communication</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Check the task board at the start of every shift for new assignments.</li>
              <li>Use the comment thread on tasks to document progress — avoid verbal-only updates.</li>
              <li>Important announcements are posted in the morning briefing — read it daily.</li>
              <li>Raise team concerns with your supervisor; do not discuss operational issues with guests.</li>
            </ul>
          </section>

          <p className="text-xs text-muted-foreground pt-2 border-t border-border">
            Questions? Speak with your department supervisor or the duty manager on shift.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FieldManualModal;
