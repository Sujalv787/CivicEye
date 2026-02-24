import { motion } from 'framer-motion';

const variants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.25, ease: 'easeIn' } },
};

export default function PageTransition({ children }) {
    return (
        <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ width: '100%' }}
        >
            {children}
        </motion.div>
    );
}
