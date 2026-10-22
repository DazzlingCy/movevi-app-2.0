import { ChevronLeft, CirclePlus, ScanLine, Bluetooth } from 'lucide-react';
import { DEFAULT_TREADMILL_NAME } from '../data/device';
import TreadmillIllustration from './TreadmillIllustration';
import Modal from './journey/Modal';
import styles from './MyDevicesView.module.css';

interface MyDevicesViewProps {
  connected: boolean;
  onBack: () => void;
  onAdd: () => void;
  onScan: () => void;
}

export default function MyDevicesView({ connected, onBack, onAdd, onScan }: MyDevicesViewProps) {
  return (
    <Modal labelId="my-devices-title" onClose={onBack} className={styles.page}>
      <header className={styles.header}>
        <button type="button" onClick={onBack} aria-label="返回" className={styles.iconButton}>
          <ChevronLeft size={28} aria-hidden="true" />
        </button>
        <h1 id="my-devices-title">我的设备</h1>
        <button type="button" onClick={onScan} aria-label="扫码添加设备" className={styles.iconButton}>
          <ScanLine size={26} aria-hidden="true" />
        </button>
      </header>
      <section className={styles.devices} aria-label="设备列表">
        {connected && <article className={styles.connectedDevice}>
          <h2>{DEFAULT_TREADMILL_NAME}</h2>
          <div className={styles.deviceArtwork}>
            <TreadmillIllustration className={styles.treadmill} />
            <span className={styles.bluetooth} role="img" aria-label="蓝牙已连接"><Bluetooth size={20} aria-hidden="true" /></span>
          </div>
        </article>}
        <button type="button" onClick={onAdd} className={styles.addDevice}>
          <CirclePlus size={30} aria-hidden="true" />
          <span>添加设备</span>
        </button>
      </section>
    </Modal>
  );
}
