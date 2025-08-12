import React, { useState } from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';
import nodeStyles from '../nodeStyles';
import { Icon } from '@iconify/react';
import { Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
const GraphNode = ({ data, type, selected, isConnectable }: NodeProps) => {
  // data.metricsHistory: [{epoch, loss, acc}]
  const metricsHistory = data.metricsHistory || [];
  return (
    <div
      className={clsx(
        "bg-gradient-to-r from-blue-800 to-blue-400 text-white rounded-xl shadow-xl border-2",
        "min-w-[320px] max-w-[480px] transition-all duration-200 p-4",
        selected ? "border-white ring-2 ring-blue-300" : "border-transparent",
      )}
    >
      <Handle
        className={nodeStyles.handle}
        isConnectable={isConnectable}
        position={Position.Left}
        type="target"
      />
      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-6 h-6" icon="lucide:line-chart" />
        <div>
          <div className="font-bold text-base">Training Metrics</div>
          <div className="text-xs opacity-80">Live Loss & Accuracy</div>
        </div>
      </div>
      <div className="bg-white rounded-lg p-3 mb-2 shadow-inner" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={metricsHistory} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
            <XAxis dataKey="epoch" tick={{ fontSize: 12 }} label={{ value: 'Epoch', position: 'insideBottom', offset: -5, fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} label={{ value: 'Value', angle: -90, position: 'insideLeft', fontSize: 12 }} />
            {/* <ChartTooltip contentStyle={{ fontSize: 12 }} /> */}
            <Legend verticalAlign="top" height={30} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="loss" stroke="#f59e42" name="Loss" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="acc" stroke="#2563eb" name="Accuracy" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {metricsHistory.length > 0 && (
        <div className="flex justify-between text-xs text-blue-100 mt-1">
          <span>Last Loss: <span className="font-mono text-orange-200">{metricsHistory[metricsHistory.length-1].loss?.toFixed(4)}</span></span>
          <span>Last Acc: <span className="font-mono text-blue-200">{(metricsHistory[metricsHistory.length-1].acc*100).toFixed(2)}%</span></span>
        </div>
      )}
      <Handle
        className={nodeStyles.handle}
        isConnectable={isConnectable}
        position={Position.Right}
        type="source"
      />
    </div>
  );
};
export default React.memo(GraphNode);
