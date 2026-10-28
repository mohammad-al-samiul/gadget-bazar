import { useState } from 'react';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';

export default {
  title: 'Primitives/Modal',
  component: Modal,
};

export const Default = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>ওপেন মডেল (Open Modal)</Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="ডেলিভারি ঠিকানা নিশ্চিত করুন"
        description="আপনার পণ্য বাংলাদেশে পৌঁছানোর পর এই ঠিকানায় কুরিয়ার হবে।"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              বাতিল
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              নিশ্চিত করুন
            </Button>
          </>
        }
      >
        <p>বাড়ি ১২, রোড ৪, সেক্টর ৯, উত্তরা, ঢাকা-১২৩০।</p>
      </Modal>
    </div>
  );
};
