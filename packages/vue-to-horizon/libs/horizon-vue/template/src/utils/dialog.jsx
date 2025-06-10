export default function Dialog(props) {
  return (
    <div className="custom-dialog">
      {props.visible
        ? window.horizon.createPortal(
            <Overlay>
              <div
                class="custom-dialog"
                role="dialog"
                aria-modal="true"
                aria-label={props.title}
                style={{ width: props.width || '500px', backgroundColor: '#1F2329' }}
              >
                {[
                  <div
                    class="dialogHeader"
                    style={{
                      position: 'relative',
                      padding: '10px',
                      boxShadow: 'rgb(62, 69, 81) 0px -1px 0px 0px inset',
                    }}
                  >
                    {props.header?.props?.children ? (
                      props.header?.props?.children()
                    ) : (
                      <p style={{ fontWeight: 'bold', fontSize: '18px', margin: 0 }}>{props.title}</p>
                    )}
                    <button
                      aria-label="el.dialog.close"
                      class="el-dialog__headerbtn"
                      type="button"
                      onClick={props.onClose}
                      style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        right: '5px',
                        top: '5px',
                        width: '24px',
                        height: '24px',
                        background: 'none',
                        border: 0,
                        color: 'white',
                        padding: 0,
                      }}
                    >
                      <i class="el-icon el-dialog__close">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                          <path
                            fill="currentColor"
                            d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"
                          ></path>
                        </svg>
                      </i>
                    </button>
                  </div>,
                  props.children,
                  props.footer?.props?.children ? <Footer>{props.footer?.props?.children()}</Footer> : null,
                ]}
              </div>
            </Overlay>,
            document.body
          )
        : null}
    </div>
  );
  // return <div>DIALOG ({props.visible?'is visible':'not visible'}) {props.children}</div>
}

Dialog.Body = function (props) {
  return <div style={{ padding: '10px' }}>{props.children}</div>;
};

const Footer = (Dialog.Footer = function (props) {
  return <div style={{ padding: '10px' }}>{props.children}</div>;
});

function Overlay(props) {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        padding: 0,
        margin: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 10000,
      }}
    >
      {props.children}
    </div>
  );
}
