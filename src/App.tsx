// Yazılacak kodu belirtmek için Layout bileşenini göstereceğim
// TRAX'da Layout'u şöyle olmalı:

export const Layout = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: '#000000',
      }}
    >
      <Header ... />
      <main style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        paddingBottom: hideNav ? '0px' : '80px',
      }}>
        <Outlet />
      </main>
      {!hideNav && <BottomNav />}
      {showAdd && <AddMemberModal ... />}
      {showBell && <NotificationPanel ... />}
    </div>
  );
};

// BottomNav ise normal flex akışında:
const BottomNav = () => {
  return (
    <div style={{
      flexShrink: 0,
      background: '#000000',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingTop: '8px',
      paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
      zIndex: 40,
    }}>
      {/* Nav bar pill */}
      <div style={{ ... }}>
        {/* Tabs */}
      </div>
    </div>
  );
};
