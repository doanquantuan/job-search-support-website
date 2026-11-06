import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

const COLOR_VARIANTS = {
  blue: {
    bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    iconBg: "bg-blue-500/15 text-blue-600",
  },
  emerald: {
    bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    iconBg: "bg-emerald-500/15 text-emerald-600",
  },
  amber: {
    bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    iconBg: "bg-amber-500/15 text-amber-600",
  },
  rose: {
    bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    iconBg: "bg-rose-500/15 text-rose-600",
  },
  purple: {
    bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    iconBg: "bg-purple-500/15 text-purple-600",
  },
};

export const MetricCard = ({
  title,
  value,
  subtext,
  change,
  changeType = "positive", // "positive" | "negative" | "neutral"
  icon: Icon,
  color = "blue",
  link,
  onClick,
  className = "",
}) => {
  const scheme = COLOR_VARIANTS[color] || COLOR_VARIANTS.blue;

  const content = (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className={`bg-base-100 rounded-2xl p-5 border border-base-300 shadow-2xs hover:shadow-md hover:border-primary/30 transition-all flex flex-col justify-between relative group ${
        onClick || link ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider line-clamp-1">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl shrink-0 ${scheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
            {value}
          </p>
          {link && (
            <ArrowUpRight className="w-4 h-4 text-base-content/30 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          )}
        </div>

        {(change || subtext) && (
          <div className="text-xs text-base-content/60 mt-1.5 flex items-center gap-1.5">
            {change && (
              <span
                className={`font-semibold inline-flex items-center gap-0.5 ${
                  changeType === "positive"
                    ? "text-emerald-600"
                    : changeType === "negative"
                    ? "text-rose-600"
                    : "text-base-content/60"
                }`}
              >
                {changeType === "positive" && <TrendingUp className="w-3.5 h-3.5" />}
                {changeType === "negative" && <TrendingDown className="w-3.5 h-3.5" />}
                {changeType === "neutral" && <Minus className="w-3.5 h-3.5" />}
                {change}
              </span>
            )}
            {subtext && <span>{subtext}</span>}
          </div>
        )}
      </div>
    </motion.div>
  );

  if (link) {
    return (
      <Link to={link} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

export default MetricCard;
