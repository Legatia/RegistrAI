export const Background = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-protex-bg">
            {/* Base Grid */}
            <div
                className="absolute inset-0 opacity-[0.1]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px), 
                                      linear-gradient(90deg, rgba(255, 255, 255, 0.3) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(circle at 50% 50%, black 40%, transparent 80%)'
                }}
            />

            {/* Scanning Line Effect */}
            <div className="scan-line z-0" />

            {/* Ambient Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px]" />
        </div>
    );
};
