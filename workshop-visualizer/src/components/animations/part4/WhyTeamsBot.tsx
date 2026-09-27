'use client';
import { motion } from 'framer-motion';
import { ComponentProps } from 'react';
import AgentBot from '../characters/AgentBot';

/**
 * AgentBot with its job caption drawn at a readable size (13px) under the name.
 * AgentBot's own caption is small, so we pass `role` here instead and draw it ourselves.
 */
export default function RoleBot({ role, ...bot }: ComponentProps<typeof AgentBot>) {
  return (
    <div className="flex flex-col items-center">
      <AgentBot {...bot} />
      {role && (
        <motion.div
          className="text-[13px] text-white/55 leading-tight text-center whitespace-nowrap"
          initial={false}
          animate={{ opacity: bot.dimmed ? 0.35 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {role}
        </motion.div>
      )}
    </div>
  );
}
