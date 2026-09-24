import React, { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { UserRole } from '../types';
import { ShieldCheck, Camera, Boxes, ArrowRight, Lock, X, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canDismiss?: boolean;
  inline?: boolean;
}

interface DepartmentConfig {
  role: UserRole;
  name: string;
  colorBorder: string;
  activeRing: string;
  btnColor: string;
  icon: React.ElementType;
}

const DEPARTMENTS: DepartmentConfig[] = [
  {
    role: 'it_admin',
    name: 'IT Department',
    colorBorder: 'border-indigo-200 hover:border-indigo-400',
    activeRing: 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20',
    btnColor: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20',
    icon: ShieldCheck,
  },
  {
    role: 'photo_team',
    name: 'Photo Team',
    colorBorder: 'border-emerald-200 hover:border-emerald-400',
    activeRing: 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20',
    btnColor: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20',
    icon: Camera,
  },
  {
    role: 'creative_team',
    name: 'Godown Team',
    colorBorder: 'border-amber-200 hover:border-amber-400',
    activeRing: 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20',
    btnColor: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20',
    icon: Boxes,
  },
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  canDismiss = true,
  inline = false,
}) => {
  const { loginWithPin, currentUser } = useWorkflow();

  const [selectedRole, setSelectedRole] = useState<UserRole>('it_admin');
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentDept = DEPARTMENTS.find((d) => d.role === selectedRole) || DEPARTMENTS[0];

  const handleSelectDepartment = (role: UserRole) => {
    setSelectedRole(role);
    setPin('');
    setErrorMsg(null);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setErrorMsg(`Please enter PIN for ${currentDept.name}`);
      return;
    }

    const res = loginWithPin(pin, selectedRole);
    if (res.success) {
      setErrorMsg(null);
      setPin('');
      if (onClose) onClose();
    } else {
      setErrorMsg(res.message);
      setPin('');
    }
  };

  const cardContent = (
    <div
      id="pin-auth-card"
      className="relative w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-300/30 overflow-hidden text-left"
    >
      {/* Top Header */}
      <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Lock className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Department Access
            </h3>
            <p className="text-xs text-slate-500">
              Type your PIN on your keyboard to enter
            </p>
          </div>
        </div>

        {canDismiss && onClose && (
          <button
            id="close-pin-modal-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Step 1: Department Selection Tabs */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Select Department
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {DEPARTMENTS.map((dept) => {
              const Icon = dept.icon;
              const isSelected = selectedRole === dept.role;
              const isCurrentSession = currentUser?.role === dept.role;

              return (
                <button
                  key={dept.role}
                  id={`dept-tab-${dept.role}`}
                  type="button"
                  onClick={() => handleSelectDepartment(dept.role)}
                  className={`p-3 rounded-2xl border-2 transition-all duration-150 flex flex-col items-center justify-center text-center cursor-pointer ${
                    isSelected
                      ? dept.activeRing
                      : `border-slate-200/80 bg-white ${dept.colorBorder} hover:bg-slate-50`
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 transition-colors ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {dept.name}
                  </span>
                  {isCurrentSession && (
                    <span className="mt-1 text-[9px] font-extrabold text-emerald-600 uppercase">
                      (Current)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Native PC Keyboard PIN Input Form */}
        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="department-pin-input"
              className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2"
            >
              Enter PIN for {currentDept.name}
            </label>

            <div className="relative">
              <input
                id="department-pin-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setPin(val);
                  setErrorMsg(null);
                }}
                className="w-full text-center tracking-[0.5em] text-xl font-bold py-3.5 px-4 bg-slate-50 border-2 border-slate-300 rounded-2xl text-slate-900 placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-medium placeholder:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
                placeholder="Type PIN on keyboard & press Enter"
                autoFocus
                autoComplete="off"
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button (or press Enter on keyboard) */}
          <button
            id="submit-pin-auth-btn"
            type="submit"
            className={`w-full py-3 px-4 text-white font-bold text-sm rounded-xl shadow-md transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${currentDept.btnColor}`}
          >
            <span>Enter {currentDept.name}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div id="pin-portal-inline" className="w-full max-w-lg mx-auto py-6 sm:py-10 animate-in fade-in duration-200">
        {cardContent}
      </div>
    );
  }

  return (
    <div
      id="pin-portal-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
    >
      {cardContent}
    </div>
  );
};
