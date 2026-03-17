import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, system-ui, sans-serif'
});

interface MermaidDiagramProps {
  chart: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (!chart) return;
      
      try {
        setError(null);
        // Clean the chart string (Gemini sometimes adds extra markdown tags)
        const cleanChart = chart.replace(/```mermaid/g, '').replace(/```/g, '').trim();
        
        // Generate a unique ID for each chart
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg: svgContent } = await mermaid.render(id, cleanChart);
        setSvg(svgContent);
      } catch (err: any) {
        console.error('Mermaid rendering error:', err);
        setError('Failed to render diagram. The generated syntax might be invalid.');
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 bg-muted/50 border border-dashed rounded-lg text-sm text-muted-foreground text-center my-6">
        {error}
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="w-full h-40 flex items-center justify-center bg-muted/20 animate-pulse rounded-lg my-6">
        <span className="text-xs text-muted-foreground">Rendering Diagram...</span>
      </div>
    );
  }

  return (
    <div 
      className="mermaid-container w-full overflow-x-auto flex justify-center bg-card p-6 rounded-xl border shadow-sm my-8 transition-all duration-300 hover:shadow-md"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default MermaidDiagram;
