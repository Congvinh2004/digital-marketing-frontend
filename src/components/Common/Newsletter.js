import React from 'react';
import './Newsletter.css';

/**
 * Newsletter Component
 * Component form đăng ký MailChimp tích hợp trực tiếp với MailChimp service
 */
const Newsletter = ({ variant = 'default' }) => {
  // Inline variant cho footer
  if (variant === 'inline') {
    return (
      <div className="newsletter-container newsletter-inline">
        <div id="mc_embed_signup">
          <form
            action="https://gmail.us18.list-manage.com/subscribe/post?u=538089c610d6d569692feae44&amp;id=f772656b18&amp;f_id=0027b3e6f0"
            method="post"
            id="mc-embedded-subscribe-form"
            name="mc-embedded-subscribe-form"
            className="validate"
            target="_blank"
            noValidate
          >
            <div id="mc_embed_signup_scroll">
              <div className="mc-field-group mc-field-group-inline">
                <input
                  type="email"
                  name="EMAIL"
                  className="required email"
                  id="mce-EMAIL-inline"
                  placeholder="Email*"
                  required
                />
                {/* Anti-spam field */}
                <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
                  <input
                    type="text"
                    name="b_538089c610d6d569692feae44_f772656b18"
                    tabIndex="-1"
                    defaultValue=""
                  />
                </div>
                <div className="optionalParent">
                  <div className="clear foot">
                    <input
                      type="submit"
                      value=""
                      name="subscribe"
                      id="mc-embedded-subscribe-inline"
                      className="button button-inline"
                      title="Đăng ký"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Default variant - full form
  return (
    <div className="newsletter-container">
      <div id="mc_embed_signup">
        <form
          action="https://gmail.us18.list-manage.com/subscribe/post?u=538089c610d6d569692feae44&amp;id=f772656b18&amp;f_id=0027b3e6f0"
          method="post"
          id="mc-embedded-subscribe-form"
          name="mc-embedded-subscribe-form"
          className="validate"
          target="_blank"
          noValidate
        >
          <div id="mc_embed_signup_scroll">
            <h2>Đăng ký nhận tin</h2>
            <p>Nhận thông tin khuyến mãi mới nhất từ F5 Mart</p>
            
            <div className="mc-field-group">
              <label htmlFor="mce-EMAIL">Địa chỉ Email <span className="asterisk">*</span></label>
              <input
                type="email"
                name="EMAIL"
                className="required email"
                id="mce-EMAIL"
                placeholder="nhap-email-cua-ban@gmail.com"
                required
              />
            </div>
            
            {/* --- PHẦN CHỐNG SPAM BOT CỦA MAILCHIMP (QUAN TRỌNG) --- */}
            {/* Không được xóa div này, nó giúp Mailchimp biết đây là người thật */}
            <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
              <input
                type="text"
                name="b_538089c610d6d569692feae44_f772656b18"
                tabIndex="-1"
                defaultValue=""
              />
            </div>
            {/* -------------------------------------------------------- */}
            
            <div className="optionalParent">
              <div className="clear foot">
                <input
                  type="submit"
                  value="Đăng ký ngay"
                  name="subscribe"
                  id="mc-embedded-subscribe"
                  className="button"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Newsletter;

