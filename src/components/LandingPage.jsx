import { motion } from "framer-motion";
import { ArrowDown, Download } from "lucide-react";
import { integrantes } from "../constants";

export const LandingPage = () => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/documentacion-megashop.pdf";
    link.download = "documentacion-megashop.pdf";
    link.click();
  };

  const scrollToSection = () => {
    const section = document.getElementById("next-section");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-screen flex flex-col justify-center items-centertext-white px-6 text-center relative overflow-hidden">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute w-96 h-96 bg-white/5 rounded-full blur-3xl"
          style={{ left: '-10%', top: '10%' }}
        />
        <motion.div 
          className="absolute w-80 h-80 bg-white/3 rounded-full blur-3xl"
          style={{ right: '-5%', bottom: '15%' }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Main Title */}
        <motion.h1 
          className="text-8xl md:text-9xl lg:text-[8rem] font-black mb-2 leading-normal"
          style={{
            background: 'linear-gradient(135deg, #60A5FA 0%, #A855F7 30%, #EC4899 60%, #F59E0B 100%)',
            backgroundSize: '150% 150%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          initial={{ opacity: 0, scale: 0.8 }}          
          whileInView={{ opacity: 1, scale: 1 }}
        >
          MegaShop
        </motion.h1>

        {/* Description */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <p className="text-2xl md:text-3xl font-light text-white/90 max-w-3xl mx-auto leading-relaxed">
            Proyecto de base de datos que simula un sistema de compras en línea
          </p>
          <p className="text-lg md:text-xl text-white/70 mt-3 font-light">
            Realizado por estudiantes con pasión por la tecnología
          </p>
        </motion.div>

        {/* Team Members */}
        <motion.div 
          className="mb-12"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          <motion.div
            className="flex flex-wrap justify-center gap-6 md:gap-8"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
          >
            {integrantes.map((name, index) => (
              <motion.div
                key={index}
                className="text-lg md:text-xl font-medium text-white/80 hover:text-white transition-colors duration-300"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.05 }}
              >
                {name}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.button
            onClick={scrollToSection}
            className="flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 font-bold text-lg rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            CRUD de tablas 
            <ArrowDown size={20} />
          </motion.button>

          <motion.button
            onClick={handleDownload}
            className="flex items-center gap-3 px-8 py-4 border-2 border-white text-white font-bold text-lg rounded-2xl hover:bg-white hover:text-indigo-600 transition-all duration-300 backdrop-blur-sm hover:shadow-2xl transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Descargar Documentación
            <Download size={20} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};