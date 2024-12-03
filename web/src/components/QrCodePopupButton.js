import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { API, showError, showSuccess } from '../helpers';


// 创建一个全局缓存对象
const qrCodeCache = {};

const QrCodePopupButton = ({ uid }) => {
  const [miniappHref, setMiniappHref] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const loadPhone = async () => {

    if (qrCodeCache[uid]) {
        setMiniappHref(qrCodeCache[uid]);
        setShowPopup(true);
        return;
      }

    const res = await API.get(`/api/58data/phone/?uid=${uid}`);
    const { success, message, data } = res.data;
    if (success) {
        console.log(data)
        const qrLink = data.miniappHref;
        qrCodeCache[uid] = qrLink;
        setMiniappHref(qrLink);
        setShowPopup(true);
    } else {
      showError(message);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        className="ui green icon button"
        onMouseEnter={loadPhone}
        onMouseLeave={() => setShowPopup(false)}
      >
        <i className="phone icon"></i>
      </div>
      {showPopup && miniappHref && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px',
          backgroundColor: 'white',
          boxShadow: '0 0 5px rgba(0,0,0,0.3)',
          borderRadius: '4px',
          zIndex: 1
        }}>
          <QRCodeSVG value={miniappHref} />
        </div>
      )}
    </div>
  );
};

export default QrCodePopupButton;
