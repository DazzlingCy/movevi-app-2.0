import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Bot, ChevronLeft, HeadphonesIcon, ImagePlus, Send, UserRound, X } from 'lucide-react';

type SupportMessage = {
  id: number;
  role: 'assistant' | 'user';
  content: string;
  time: string;
  image?: {
    dataUrl: string;
    name: string;
  };
};

type OnlineSupportViewProps = {
  onBack: () => void;
};

const QUICK_QUESTIONS = [
  '跑步机无法连接',
  '屏幕没有反应',
  '跑带卡顿或异响',
  '速度无法调节',
  '急停提示无法消除',
  '路线完成后未点亮',
  '奖励没有到账'
];

const getReply = (question: string) => {
  if (/屏幕|黑屏|没有反应|不开机/.test(question)) {
    return '请先检查电源线、插座和机身电源开关，确认安全锁已正确吸附。断电 30 秒后重新启动；如果屏幕仍无反应，请拍摄电源与屏幕状态发给我。';
  }
  if (/跑带|卡顿|异响|打滑|偏移/.test(question)) {
    return '请先停止使用并断开电源，检查跑带内是否卷入异物。不要在运行中调节跑带；可拍摄跑带位置和异响部位，我会继续协助判断。';
  }
  if (/速度|加速|减速|调节/.test(question)) {
    return '请确认安全锁已吸附且跑步机未处于暂停状态，再尝试机身按键和 App 调速。如果两处都无响应，请重启设备并拍摄控制面板状态。';
  }
  if (/急停|安全锁|提示无法消除/.test(question)) {
    return '请取下安全锁，擦拭接触位置后重新吸附，并等待 3 秒。如果提示仍在，请断电重启；为安全起见，故障消除前请勿启动跑带。';
  }
  if (/跑步机|连接|蓝牙|设备/.test(question)) {
    return '请确认跑步机已通电并开启蓝牙，再回到首页点击右上角设备按钮重新连接。如果仍无法连接，可重启设备后再试。';
  }
  if (/路线|点亮|进度|城市/.test(question)) {
    return '路线完成后通常会立即同步。请检查运动里程是否达到路线要求，并保持网络连接；重新进入城市路线页可刷新点亮状态。';
  }
  if (/奖励|红包|到账|光迹值/.test(question)) {
    return '奖励可能有短暂同步延迟。请先在“我的钱包”查看记录；若 10 分钟后仍未到账，请提供完成时间和路线名称。';
  }
  return '已收到你的问题。为了更快定位，请补充相关城市、路线名称、发生时间或设备状态，我会继续协助你处理。';
};

const formatTime = () => new Intl.DateTimeFormat('zh-CN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}).format(new Date());

export default function OnlineSupportView({ onBack }: OnlineSupportViewProps) {
  const [input, setInput] = useState('');
  const [pendingImage, setPendingImage] = useState<{ dataUrl: string; name: string } | null>(null);
  const [imageError, setImageError] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([
    {
      id: 1,
      role: 'assistant',
      content: '你好，我是 Movevi 智能客服小迹。请描述你遇到的问题，或选择下方常见问题。',
      time: formatTime()
    }
  ]);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const replyTimerRef = useRef<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isReplying]);

  useEffect(() => () => {
    if (replyTimerRef.current !== null) window.clearTimeout(replyTimerRef.current);
  }, []);

  const sendMessage = (content: string) => {
    const question = content.trim();
    const image = pendingImage;
    if ((!question && !image) || isReplying) return;

    setMessages(previous => [
      ...previous,
      { id: Date.now(), role: 'user', content: question, image: image ?? undefined, time: formatTime() }
    ]);
    setInput('');
    setPendingImage(null);
    setImageError('');
    if (imageInputRef.current) imageInputRef.current.value = '';
    setIsReplying(true);

    replyTimerRef.current = window.setTimeout(() => {
      setMessages(previous => [
        ...previous,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: image && !question
            ? '图片已收到。请再补充故障现象，例如是否能开机、是否有异响或屏幕提示，我会结合图片继续判断。'
            : getReply(question),
          time: formatTime()
        }
      ]);
      setIsReplying(false);
      replyTimerRef.current = null;
    }, 650);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(input);
  };

  const handleImageChange = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('请选择图片文件');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('图片不能超过 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      setPendingImage({ dataUrl: reader.result, name: file.name });
      setImageError('');
    };
    reader.onerror = () => setImageError('图片读取失败，请重新选择');
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#05070a] text-slate-100">
      <header className="shrink-0 border-b border-white/10 bg-[#07111c]/95 px-4 pb-2 pt-safeb backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-slate-200 outline-none active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-200/60"
            aria-label="返回"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="text-center">
            <h1 className="text-base font-black text-white">在线客服</h1>
            <div className="mt-0.5 flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.65)]" />
              客服在线
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-300/10 text-cyan-100" aria-hidden="true">
            <HeadphonesIcon size={19} />
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 hide-scrollbar" aria-live="polite">
        <div className="mb-5 text-center text-[10px] font-bold text-slate-600">当前为模拟客服会话</div>
        <div className="space-y-4">
          {messages.map(message => (
            <div key={message.id} className={`flex items-end gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-100">
                  <Bot size={17} />
                </div>
              )}
              <div className={`max-w-[78%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`overflow-hidden rounded-[20px] text-left text-sm font-bold leading-6 ${
                  message.role === 'user'
                    ? 'rounded-br-md bg-cyan-200 text-slate-950'
                    : 'rounded-bl-md border border-white/10 bg-[#0c1724] text-slate-200'
                }`}>
                  {message.image && (
                    <img
                      src={message.image.dataUrl}
                      alt={message.image.name}
                      className="max-h-64 w-full bg-slate-900 object-cover"
                    />
                  )}
                  {message.content && <p className="px-4 py-3">{message.content}</p>}
                </div>
                <span className="mt-1.5 inline-block px-1 font-mono text-[9px] text-slate-600">{message.time}</span>
              </div>
              {message.role === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-slate-400">
                  <UserRound size={16} />
                </div>
              )}
            </div>
          ))}

          {isReplying && (
            <div className="flex items-end gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-100">
                <Bot size={17} />
              </div>
              <div className="flex h-11 items-center gap-1.5 rounded-[20px] rounded-bl-md border border-white/10 bg-[#0c1724] px-4" aria-label="客服正在输入">
                {[0, 1, 2].map(index => (
                  <span key={index} className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-200/70 motion-reduce:animate-none" style={{ animationDelay: `${index * 120}ms` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={scrollAnchorRef} />
        </div>
      </main>

      <section className="shrink-0 border-t border-white/10 bg-[#07111c]/96 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <div className="mb-3 flex gap-2 overflow-x-auto hide-scrollbar" aria-label="常见问题">
          {QUICK_QUESTIONS.map(question => (
            <button
              key={question}
              type="button"
              disabled={isReplying}
              onClick={() => sendMessage(question)}
              className="shrink-0 rounded-full border border-cyan-200/16 bg-cyan-300/[0.06] px-3 py-2 text-[11px] font-black text-cyan-100 active:scale-95 disabled:opacity-45"
            >
              {question}
            </button>
          ))}
        </div>
        {pendingImage && (
          <div className="relative mb-3 w-24 overflow-hidden rounded-2xl border border-cyan-200/20 bg-slate-900 p-1">
            <img src={pendingImage.dataUrl} alt="待发送图片预览" className="h-20 w-full rounded-xl object-cover" />
            <button
              type="button"
              onClick={() => {
                setPendingImage(null);
                if (imageInputRef.current) imageInputRef.current.value = '';
              }}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white"
              aria-label="移除待发送图片"
            >
              <X size={14} />
            </button>
          </div>
        )}
        {imageError && <p className="mb-2 text-xs font-bold text-rose-300" role="alert">{imageError}</p>}
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={event => handleImageChange(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={isReplying}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-cyan-100 outline-none active:scale-95 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-cyan-200/60"
            aria-label="选择图片"
          >
            <ImagePlus size={19} />
          </button>
          <label htmlFor="support-message" className="sr-only">输入客服消息</label>
          <textarea
            id="support-message"
            value={input}
            rows={1}
            maxLength={300}
            onChange={event => setInput(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="请输入你的问题"
            className="max-h-24 min-h-11 flex-1 resize-none rounded-[20px] border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold leading-5 text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/40"
          />
          <button
            type="submit"
            disabled={(!input.trim() && !pendingImage) || isReplying}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-200 text-slate-950 shadow-[0_8px_24px_rgba(34,211,238,0.18)] active:scale-95 disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none"
            aria-label="发送消息"
          >
            <Send size={18} />
          </button>
        </form>
      </section>
    </div>
  );
}
