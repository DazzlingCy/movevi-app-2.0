import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  CalendarCheck2,
  Check,
  ChevronLeft,
  CircleDollarSign,
  Dumbbell,
  Headphones,
  MessageCircleMore,
  Smartphone,
  Sparkles,
  UsersRound,
  Video
} from 'lucide-react';

export type PurchaseRefundMachineType = 'TS2' | 'TS2PRO' | 'TS3' | 'TS3PRO';
export type PurchaseRefundCampaignStatus =
  | 'unregistered'
  | 'registrationPending'
  | 'registrationRejected'
  | 'active'
  | 'expired'
  | 'completed'
  | 'refundPending'
  | 'refunded';

export interface PurchaseRefundRegistration {
  machineCode: string;
  machineType: PurchaseRefundMachineType;
  name: string;
  phone: string;
  submittedAt: number;
  approvedAt?: number;
  rejectionReason?: string;
}

export interface PurchaseRefundCheckIn {
  id: string;
  day: number;
  date: string;
  url: string;
  submittedAt: number;
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt?: number;
  rejectionReason?: string;
}

export interface PurchaseRefundCampaignState {
  status: PurchaseRefundCampaignStatus;
  registration: PurchaseRefundRegistration | null;
  checkIns: PurchaseRefundCheckIn[];
  refundRequestedAt?: number;
  refundedAt?: number;
}

interface PurchaseRefundCampaignViewProps {
  campaign: PurchaseRefundCampaignState;
  onBack: () => void;
  onOpenSupport?: () => void;
  onSubmitRegistration: (registration: Omit<PurchaseRefundRegistration, 'submittedAt' | 'approvedAt' | 'rejectionReason'>) => { success: boolean; message: string };
  onReviewRegistration: (approved: boolean) => void;
  onSubmitCheckIn: (url: string) => { success: boolean; message: string };
  onReviewCheckIn: (id: string, approved: boolean) => void;
  onRequestRefund: () => void;
  onConfirmRefund: () => void;
  onDemoNearCompletion: () => void;
  onDemoExpire: () => void;
  onResetDemo: () => void;
}

const CONTENT_IDEAS = [
  '第一次跑木卫六',
  '下班回家跑20分钟',
  '边看城市路线边走步',
  '今天完成第7天',
  '和家人一起运动',
  '完成30天打卡后的变化'
];

function PageHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#060907]/94 backdrop-blur-xl">
      <div className="grid h-16 grid-cols-[44px_1fr_44px] items-center px-4">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.07] text-white outline-none transition active:scale-95 focus-visible:ring-2 focus-visible:ring-[#d8ff32]"
          aria-label="返回"
        >
          <ChevronLeft size={23} />
        </button>
        <h1 className="text-center text-lg font-black tracking-[-0.04em] text-white">打卡返购机费</h1>
        <span />
      </div>
    </header>
  );
}

function PosterPanel({ number, title, icon, children }: { number: string; title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-[22px] border-[3px] border-dotted border-[#151b12] bg-[#fffef0] p-4 text-[#151b12] shadow-[4px_5px_0_#151b12]">
      <div className="flex items-center justify-between gap-3 border-b-2 border-[#151b12] pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 min-w-8 items-center justify-center bg-[#151b12] px-2 font-mono text-[11px] font-black text-[#f8db27]">{number}</span>
          <h2 className="truncate text-base font-black tracking-[-0.03em]">{title}</h2>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#151b12] bg-[#d7ff32] text-[#151b12]">{icon}</span>
      </div>
      <div className="mt-4 text-[13px] font-medium leading-[1.75]">{children}</div>
    </section>
  );
}

function CampaignPoster() {
  const viteBaseUrl = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL || '/';
  const backgroundSrc = `${viteBaseUrl}purchase-refund-poster-bg.jpg`;

  return (
    <article className="relative overflow-hidden rounded-[26px] border-[3px] border-[#151b12] bg-[#efffac] text-[#151b12] shadow-[0_28px_70px_rgba(0,0,0,0.38)]">
      <img src={backgroundSrc} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-fill opacity-30" />
      <div className="pointer-events-none absolute inset-0 bg-[#efffac]/65" />
      <div className="relative px-4 pb-6 pt-5">
        <div className="flex items-center justify-between gap-3">
          <span className="bg-[#151b12] px-3 py-1.5 text-[10px] font-black tracking-[0.12em] text-white">MOVEVI</span>
          <span className="rounded-full border-2 border-[#151b12] bg-[#f8db27] px-3 py-1.5 text-[10px] font-black">每月限10位</span>
        </div>

        <header className="mt-7 rounded-[24px] border-2 border-[#151b12] bg-[#fffef0]/95 px-4 pb-6 pt-7 text-center shadow-[5px_6px_0_#8ddd27]">
          <div className="inline-flex -rotate-2 items-center gap-2 rounded-full border-2 border-[#151b12] bg-[#8ddd27] px-4 py-2 text-xs font-black shadow-[3px_3px_0_#151b12]">
            <Sparkles size={15} />木卫六运动计划
          </div>
          <p className="mt-5 text-[13px] font-black tracking-[0.06em]">买了木卫六，就好好用起来</p>
          <h2 className="mt-3 text-[34px] font-black leading-[1.02] tracking-[-0.075em] sm:text-[44px]">
            30天运动打卡
            <span className="mx-auto mt-3 block max-w-[300px] -rotate-1 bg-[#151b12] px-3 py-2.5 text-[#d7ff32] shadow-[5px_5px_0_#f8db27]">返购机款</span>
          </h2>
          <p className="mx-auto mt-6 max-w-sm text-[13px] font-bold leading-6">
            在规定时间内运动打卡30天，记录真实运动生活。<br />
            完成打卡后，购机款全额返还。
            <span className="mt-1 block text-[11px] font-semibold opacity-70">返购机款金额上限不超过1800元。</span>
          </p>
          <div className="mx-auto mt-6 grid max-w-sm grid-cols-3 overflow-hidden border-2 border-[#151b12] bg-[#fffef0] shadow-[4px_4px_0_#8ddd27]">
            {[['30天', '目标打卡'], ['60天', '完成周期'], ['最高1800元', '购机款返还']].map(([value, label], index) => (
              <div key={label} className={`py-3 ${index > 0 ? 'border-l-2 border-[#151b12]' : ''}`}>
                <p className="font-mono text-lg font-black">{value}</p>
                <p className="mt-0.5 text-[9px] font-bold opacity-60">{label}</p>
              </div>
            ))}
          </div>
        </header>

        <div className="mt-7 space-y-5 rounded-[26px] border-2 border-[#151b12] bg-[#8ddd27] px-3 pb-6 pt-5 sm:px-5">
          <div className="mx-auto w-fit -rotate-1 bg-[#151b12] px-5 py-2.5 text-center text-base font-black text-[#f8db27] shadow-[3px_3px_0_#fffef0]">活动攻略</div>

          <PosterPanel number="01" title="活动怎么参加" icon={<CalendarCheck2 size={21} />}>
            <p className="mb-4 font-black">只有3步，简单开始。</p>
            <ol className="space-y-3">
              {[
                ['每天运动', '使用木卫六跑步机或走步机，家人也可以参与。', Dumbbell],
                ['拍真实视频', '用手机记录运动日常，并分享到抖音。', Video],
                ['完成30天', '从第一条视频开始，60天内完成30天打卡。', CalendarCheck2]
              ].map(([title, description, Icon], index) => {
                const StepIcon = Icon as typeof Dumbbell;
                return (
                  <li key={String(title)} className="flex items-start gap-3 border-b border-dashed border-black/20 pb-3 last:border-0 last:pb-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#151b12] text-[#d7ff32]"><StepIcon size={16} /></span>
                    <div><p className="font-black">{index + 1}. {String(title)}</p><p className="mt-0.5 text-[11px] leading-5 opacity-65">{String(description)}</p></div>
                  </li>
                );
              })}
            </ol>
            <div className="mt-4 flex items-center gap-3 bg-[#f8db27] p-3 font-black shadow-[3px_3px_0_#151b12]"><CircleDollarSign size={20} />完成要求，申请全额返还购机款</div>
          </PosterPanel>

          <PosterPanel number="02" title="拍什么都可以" icon={<Smartphone size={21} />}>
            <p className="font-bold">不需要专业设备，也不需要复杂剪辑。真实的你、真实的运动，就是最好的内容。</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {CONTENT_IDEAS.map(item => <span key={item} className="border border-[#151b12]/30 bg-[#eefbcf] px-2 py-2 text-center text-[10px] font-bold">{item}</span>)}
            </div>
            <div className="mt-4 flex items-center justify-between border-t-2 border-[#151b12] pt-4">
              <span className="font-black">建议时长</span>
              <strong className="bg-[#151b12] px-3 py-1 font-mono text-lg text-[#f8db27]">15—50秒</strong>
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-bold">
              {['不要求复杂剪辑', '不要求专业设备', '拍摄方式自由', '可提供剪辑协助'].map(item => <li key={item} className="flex items-center gap-1.5"><Check size={13} strokeWidth={3} />{item}</li>)}
            </ul>
          </PosterPanel>

          <PosterPanel number="03" title="谁可以参加" icon={<UsersRound size={21} />}>
            <p className="font-black">已购买以下木卫六产品的用户：</p>
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {(['TS2', 'TS2PRO', 'TS3', 'TS3PRO'] as PurchaseRefundMachineType[]).map(model => <span key={model} className="flex h-9 items-center justify-center bg-[#151b12] font-mono text-[10px] font-black text-white">{model}</span>)}
            </div>
            <div className="mt-4 grid gap-2 text-[11px] font-bold">
              {['抖音个人生活号即可，粉丝数量≥1', '账号状态正常，无其他进行中的商业合作', '不需要成为网红，只需记录真实运动生活'].map(item => <p key={item} className="flex items-start gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8ddd27]" />{item}</p>)}
            </div>
          </PosterPanel>

          <PosterPanel number="04" title="坚持能得到什么" icon={<Sparkles size={21} />}>
            <div className="space-y-3">
              {[
                ['运动习惯', '一个真正坚持下来的运动习惯'],
                ['生活记录', '30天属于自己的真实运动记录'],
                ['购机款返还', '完成活动要求后，全额返还购机款']
              ].map(([title, description], index) => <div key={title} className={`flex items-center gap-3 border-2 border-[#151b12] p-3 ${index === 2 ? 'bg-[#f8db27]' : 'bg-white'}`}><span className="font-mono text-xl font-black">0{index + 1}</span><div><p className="font-black">{title}</p><p className="text-[10px] opacity-60">{description}</p></div></div>)}
            </div>
            <p className="mt-5 border-l-4 border-[#151b12] pl-3 text-sm font-black leading-6">你负责坚持运动，木卫六负责为你的坚持买单。</p>
          </PosterPanel>
        </div>

        <section className="mt-7 border-[3px] border-[#151b12] bg-[#f8db27] p-4 shadow-[5px_5px_0_#151b12]">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#151b12] text-[#d7ff32]"><Headphones size={22} /></span>
            <div className="min-w-0">
              <p className="text-base font-black">活动咨询</p>
              <p className="mt-1 text-[11px] font-bold leading-5 opacity-70">点击下方客服按钮，一对一咨询报名、拍摄与购机款返还细则。</p>
            </div>
          </div>
        </section>

        <div className="mt-8 rounded-[20px] border-2 border-[#151b12] bg-[#fffef0]/95 px-4 py-5 text-center">
          <p className="text-xl font-black">30天，坚持一次。</p>
          <p className="mt-1 text-sm font-bold">让运动真正发生。</p>
          <p className="mt-5 text-[10px] font-medium leading-5 opacity-60">活动测试阶段，每个自然月仅服务10位用户，名额满后顺延至下一期，敬请谅解。</p>
          <div className="mt-5 flex items-end justify-between border-t-2 border-[#151b12] pt-4 text-left"><div><p className="text-lg font-black">木卫六</p><p className="text-[9px] font-bold tracking-[0.12em]">把世界装进跑步机</p></div><span className="font-mono text-sm font-black">MOVEVI</span></div>
        </div>
      </div>
    </article>
  );
}

export default function PurchaseRefundCampaignView({ onBack, onOpenSupport }: PurchaseRefundCampaignViewProps) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="absolute inset-0 z-50 overflow-y-auto bg-[#070a07] text-white [color-scheme:dark]">
      <PageHeader onBack={onBack} />
      <motion.main initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }} className="mx-auto w-full max-w-xl px-3 pb-[calc(104px+env(safe-area-inset-bottom))] pt-3 sm:px-4">
        <CampaignPoster />
      </motion.main>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#070a07]/94 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <div className="mx-auto max-w-xl">
          <button type="button" onClick={onOpenSupport} className="group flex h-14 w-full items-center justify-between rounded-2xl border-2 border-[#151b12] bg-[#d7ff32] px-4 text-[#151b12] shadow-[4px_4px_0_#f8db27] outline-none transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:ring-2 focus-visible:ring-white">
            <span className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#151b12] text-[#d7ff32]"><Headphones size={19} /></span><span className="text-left"><span className="block text-sm font-black">打卡返购机费咨询</span><span className="block text-[10px] font-bold opacity-55">在线客服为你解答</span></span></span>
            <span className="flex items-center gap-1 text-xs font-black"><MessageCircleMore size={17} /><ArrowRight size={17} /></span>
          </button>
        </div>
      </div>
    </div>
  );
}
