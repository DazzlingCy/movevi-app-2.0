import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  ChevronLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  UserPlus
} from 'lucide-react';

export type AuthUser = {
  name: string;
  phone: string;
  memberId: string;
};

type AuthViewProps = {
  onBack: () => void;
  onSuccess: (user: AuthUser) => void;
};

export default function AuthView({ onBack, onSuccess }: AuthViewProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [message, setMessage] = useState('');

  const normalizedPhone = phone.replace(/\D/g, '').slice(0, 11);
  const canSubmit = normalizedPhone.length === 11 && code.length >= 4 && (mode === 'login' || (password.length >= 6 && agreed));

  const helperText = useMemo(() => {
    if (mode === 'login') return '验证码登录，快速回到你的城市探索进度。';
    return '注册后可同步设备、钱包、勋章和运动记录。';
  }, [mode]);

  const handleSendCode = () => {
    if (normalizedPhone.length !== 11) {
      setMessage('请输入 11 位手机号');
      return;
    }
    setCodeSent(true);
    setCode('3026');
    setMessage('验证码已发送，演示验证码 3026 已自动填入');
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      setMessage(mode === 'login' ? '请填写手机号和验证码' : '请填写完整信息并勾选协议');
      return;
    }

    onSuccess({
      name: mode === 'login' ? '沐小六' : '新跑者',
      phone: normalizedPhone,
      memberId: `MV-${normalizedPhone.slice(-4)}`
    });
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-[#05070A] px-5 pb-10 pt-safeb text-slate-100 hide-scrollbar">
      <div className="sticky top-0 z-20 -mx-5 flex items-center justify-between border-b border-white/10 bg-[#05070A]/80 px-5 py-3 backdrop-blur-xl">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-200 active:scale-95"
          aria-label="返回"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-black tracking-[0.28em] text-cyan-200/70">账号</p>
          <h1 className="text-lg font-black">账号登录</h1>
        </div>
        <div className="h-11 w-11" />
      </div>

      <section className="relative mt-5 overflow-hidden rounded-[32px] border border-cyan-200/15 bg-[#09111b] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.36)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.20),transparent_38%),radial-gradient(circle_at_100%_20%,rgba(251,191,36,0.16),transparent_42%)]" />
        <div className="relative">
          <div className="flex rounded-full border border-white/10 bg-black/30 p-1">
            {[
              { id: 'login', label: '登录', icon: LogIn },
              { id: 'register', label: '注册', icon: UserPlus }
            ].map(item => {
              const Icon = item.icon;
              const active = mode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setMode(item.id as 'login' | 'register');
                    setMessage('');
                  }}
                  className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-black transition-colors ${
                    active ? 'bg-cyan-300 text-slate-950 shadow-[0_12px_32px_rgba(34,211,238,0.24)]' : 'text-slate-400'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            <p className="text-[11px] font-black uppercase tracking-[0.32em] text-cyan-200/70">MOVE VI</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">{mode === 'login' ? '欢迎回来' : '创建账号'}</h2>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-400">{helperText}</p>
          </div>

          <div className="mt-7 space-y-3">
            <label className="block rounded-2xl border border-white/10 bg-black/24 px-4 py-3 focus-within:border-cyan-300/50">
              <span className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <Smartphone size={15} />
                手机号
              </span>
              <input
                value={normalizedPhone}
                onChange={event => setPhone(event.target.value)}
                inputMode="tel"
                placeholder="请输入手机号"
                className="mt-2 w-full bg-transparent text-lg font-black text-white outline-none placeholder:text-slate-700"
              />
            </label>

            <div className="grid grid-cols-[1fr_auto] gap-3">
              <label className="block rounded-2xl border border-white/10 bg-black/24 px-4 py-3 focus-within:border-cyan-300/50">
                <span className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <ShieldCheck size={15} />
                  验证码
                </span>
                <input
                  value={code}
                  onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  placeholder="3026"
                  className="mt-2 w-full bg-transparent text-lg font-black text-white outline-none placeholder:text-slate-700"
                />
              </label>
              <button
                type="button"
                onClick={handleSendCode}
                className="w-28 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 text-xs font-black text-cyan-100 active:scale-95"
              >
                {codeSent ? '重新发送' : '发送验证码'}
              </button>
            </div>

            {mode === 'register' && (
              <label className="block rounded-2xl border border-white/10 bg-black/24 px-4 py-3 focus-within:border-cyan-300/50">
                <span className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <LockKeyhole size={15} />
                  登录密码
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="至少 6 位"
                    className="min-w-0 flex-1 bg-transparent text-lg font-black text-white outline-none placeholder:text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="text-slate-500 active:scale-95"
                    aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
            )}
          </div>

          {mode === 'register' && (
            <button
              type="button"
              onClick={() => setAgreed(prev => !prev)}
              className="mt-4 flex items-center gap-2 text-left text-xs font-bold leading-5 text-slate-400"
            >
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${agreed ? 'border-emerald-300 bg-emerald-300/20 text-emerald-200' : 'border-white/15 text-transparent'}`}>
                <CheckCircle2 size={13} />
              </span>
              我已阅读并同意《用户协议》和《隐私政策》
            </button>
          )}

          {message && (
            <div className="mt-4 rounded-2xl border border-cyan-200/15 bg-cyan-300/8 px-4 py-3 text-xs font-bold text-cyan-100">
              {message}
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleSubmit}
            className={`mt-6 h-13 w-full rounded-full text-base font-black shadow-[0_18px_42px_rgba(34,211,238,0.18)] ${
              canSubmit ? 'bg-gradient-to-r from-cyan-200 via-teal-200 to-amber-100 text-slate-950' : 'bg-white/8 text-slate-500'
            }`}
          >
            {mode === 'login' ? '立即登录' : '完成注册'}
          </motion.button>

          <button
            type="button"
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] text-sm font-black text-slate-300 active:scale-95"
          >
            <MessageCircle size={18} />
            微信一键登录
          </button>
        </div>
      </section>
    </div>
  );
}
