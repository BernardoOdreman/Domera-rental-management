import React from 'react';

const House = () => {
    // Definir las animaciones como constantes de cadena
    const keyframes = `
    @keyframes load1 {
        0% { bottom: 0; height: 0; }
        6.944444444% { bottom: 0; height: 100%; }
        50% { top: 0; height: 100%; }
        59.944444433% { top: 0; height: 0; }
    }
    @keyframes load2 {
        0% { top: 0; height: 0; }
        6.944444444% { top: 0; height: 100%; }
        50% { bottom: 0; height: 100%; }
        59.944444433% { bottom: 0; height: 0; }
    }
    @keyframes load3 {
        0% { top: 0; height: 0; }
        6.944444444% { top: 0; height: 100%; }
        50% { bottom: 0; height: 100%; }
        59.94444443% { bottom: 0; height: 0; }
    }
    @keyframes load4 {
        0% { top: 37px; left: 23px; height: 134%; }
        6.944444444% { top: 10px; height: 134%; }
        50% { bottom: 10px; height: 134%; }
        59.94444443% { bottom: 0; height: 0; }
    }
    @keyframes load5 {
        0% { bottom: 0; height: 0; }
        6.944444444% { bottom: 0; height: 100%; }
        50% { top: 0; height: 100%; }
        59.94444443% { top: 0; height: 0; }
    }
    @keyframes load6 {
        0% { bottom: 0; height: 0; }
        6.944444444% { bottom: 0; height: 100%; }
        50% { top: 0; height: 100%; }
        59.94444443% { top: 0; height: 0; }
    }
    `;

    return (
        <div>
        <style>{keyframes}</style>

        {/* Contenedor principal */}
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            width: '90px',
            height: '103px'
        }}>
        {/* Grupo 1 */}
        <div style={{ position: 'absolute', width: '50px', height: '31px' }}>
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <span style={{
            position: 'absolute',
            width: '4px',
            height: '0%',
            background: '#053146',
            zIndex: 999999,
            left: '0',
            animation: 'load6 3.2s ease 1.3s infinite'
        }} />
        <span style={{
            position: 'absolute',
            width: '4px',
            height: '0%',
            background: '#053146',
            zIndex: 999999,
            right: '0',
            animation: 'load3 3.2s ease 0.8s infinite'
        }} />
        </div>
        </div>

        {/* Grupo 2 */}
        <div style={{
            position: 'absolute',
            width: '50px',
            height: '31px',
            transform: 'rotate(60deg)'
        }}>
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <span style={{
            position: 'absolute',
            width: '4px',
            height: '0%',
            background: '#053146',
            zIndex: 999999,
            left: '0',
            animation: 'load1 3.2s ease infinite'
        }} />
        </div>
        </div>

        {/* Grupo 3 */}
        <div style={{
            position: 'absolute',
            width: '50px',
            height: '31px',
            transform: 'rotate(-60deg)'
        }}>
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <span style={{
            position: 'absolute',
            width: '4px',
            height: '0%',
            background: '#053146',
            zIndex: 999999,
            right: '0',
            animation: 'load2 3.2s ease 0.4s infinite'
        }} />
        </div>
        </div>

        {/* Grupo 4 */}
        <div style={{ position: 'absolute', width: '50px', height: '31px' }}>
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <span style={{
            position: 'absolute',
            width: '4px',
            height: '0%',
            background: '#053146',
            zIndex: 999999,
            top: '10px',
            left: '23px',
            animation: 'load4 3.2s ease 1s infinite',
            transform: 'rotate(90deg)'
        }} />
        </div>
        </div>
        </div>
        </div>
    );
};

export default House;
