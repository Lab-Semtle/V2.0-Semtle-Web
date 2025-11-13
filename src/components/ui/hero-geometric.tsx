"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ElegantShapeProps = {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
};

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: ElegantShapeProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
        scale: 0.8,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
        scale: 1,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
        scale: { duration: 1.8, delay: delay + 0.3 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 12, 0],
          rotate: [0, 3, 0],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-br via-transparent to-transparent",
            gradient,
            "backdrop-blur-[2px] border border-white/10",
            "shadow-[0_8px_24px_-8px_rgba(59,130,246,0.15)]",
            "before:absolute before:inset-0 before:rounded-full",
            "before:bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_60%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

type HeroGeometricProps = {
  badge?: string;
  title1?: string;
  title2?: string;
  title3?: string;
  description?: string;
  className?: string;
};

export function HeroGeometric({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  badge = "아치셈틀",
  title1 = "KOREA MARITIME & OCEAN UNIV.",
  title2 = "Division of Artificial Intelligence Engineering",
  title3 = "국립한국해양대학교 인공지능공학부 아치셈틀",
  description,
  className,
}: HeroGeometricProps) {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1] as const,
      },
    }),
  };

  return (
    <div className={cn("relative min-h-[40vh] sm:min-h-[45vh] md:min-h-[50vh] lg:min-h-[55vh] w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-sky-50/30 to-blue-50/20", className)}>
      {/* 기하학적 형태 배경 - 절제되고 우아하게 */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {/* 대형 도형들 - 메인 포인트 */}
        <ElegantShape
          delay={0.2}
          width={600}
          height={150}
          rotate={15}
          gradient="from-cyan-300/[0.08] via-blue-300/[0.05]"
          className="left-[-8%] md:left-[-3%] top-[15%] md:top-[20%]"
        />
        <ElegantShape
          delay={0.4}
          width={500}
          height={130}
          rotate={-18}
          gradient="from-indigo-300/[0.07] via-purple-300/[0.04]"
          className="right-[-6%] md:right-[-2%] top-[65%] md:top-[70%]"
        />

        {/* 중형 도형들 - 균형감 */}
        <ElegantShape
          delay={0.5}
          width={380}
          height={100}
          rotate={-10}
          gradient="from-teal-300/[0.06] via-cyan-300/[0.04]"
          className="left-[10%] md:left-[15%] bottom-[10%] md:bottom-[15%]"
        />
        <ElegantShape
          delay={0.6}
          width={350}
          height={90}
          rotate={20}
          gradient="from-sky-300/[0.06] via-blue-300/[0.04]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />

        {/* 소형 도형들 - 미묘한 디테일 */}
        <ElegantShape
          delay={0.7}
          width={250}
          height={65}
          rotate={12}
          gradient="from-cyan-200/[0.05] via-teal-200/[0.03]"
          className="right-[30%] md:right-[35%] bottom-[20%] md:bottom-[25%]"
        />
        <ElegantShape
          delay={0.8}
          width={220}
          height={60}
          rotate={-25}
          gradient="from-blue-200/[0.05] via-sky-200/[0.03]"
          className="left-[50%] md:left-[55%] top-[30%] md:top-[35%]"
        />
      </div>

      {/* Bottom fade to features section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-slate-50/90 z-[1] pointer-events-none"></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto text-center">

          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 md:mb-4 tracking-tight">
              <span className="text-slate-900 drop-shadow-lg">
                {title1}
              </span>
            </h1>
          </motion.div>

          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-base md:text-lg lg:text-xl xl:text-2xl font-semibold text-slate-800 mb-3 md:mb-4 drop-shadow-lg">
              {title2}
            </h2>
          </motion.div>

          <motion.div
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <h3 className="text-base md:text-lg lg:text-xl xl:text-2xl font-semibold text-slate-900 drop-shadow-lg">
              {title3}
            </h3>
          </motion.div>

          {description && (
            <motion.div
              custom={4}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
            >
              <p className="text-sm md:text-base text-slate-600 mt-6 md:mt-8 leading-relaxed font-light tracking-wide max-w-2xl mx-auto px-4">
                {description}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export type { HeroGeometricProps, ElegantShapeProps };

