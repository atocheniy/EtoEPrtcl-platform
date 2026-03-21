import React, { useEffect, useRef, useState } from 'react';
import ForceGraph2D, { type GraphData, type NodeObject } from 'react-force-graph-2d';
import { useTheme } from '@mui/material/styles';
import { Box, Checkbox, Divider, FormControlLabel, Paper, Slider, Stack, Typography } from '@mui/material';

import * as d3 from 'd3-force';
import { useEncryption } from '../context/EncryptionContext';

interface GraphNode extends NodeObject {
  id: string;
  name: string;
  val: number; 
  color?: string;
  isProject?: boolean; 
  isTag?: boolean; 
}

interface GraphLink {
  source: string;
  target: string;
}

interface GraphViewProps {
  files: any[];
  projects: { id: string, name: string }[];
  onNodeClick: (fileId: string) => void;
}

const GraphView: React.FC<GraphViewProps> = ({ files, projects, onNodeClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] });

  const [chargeStrength, setChargeStrength] = useState(-100); 
  const [gravityStrength, setGravityStrength] = useState(0.10); 
  const [collisionRadius, setCollisionRadius] = useState(25); 
  const [particleSpeed, setParticleSpeed] = useState(0.005);

  const [showProjects, setShowProjects] = useState(true);
  const [showTags, setShowTags] = useState(true); 
  const [showLinks, setShowLinks] = useState(true);

  const { orbColors } = useEncryption();

  const fgRef = useRef<any>(null); 

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          w: containerRef.current.offsetWidth,
          h: containerRef.current.offsetHeight
        });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

 useEffect(() => {
    if (!fgRef.current) return;

    const fg = fgRef.current;

    fg.d3Force('link')
      .distance((link: any) => {
          if (link.isProjectLink) return 100;
          if (link.isTagLink) return 60;
          return 40;
      }) 
      .strength((link: any) => link.isProjectLink ? 0.2 : 0.4);

    fg.d3Force('x', d3.forceX(0).strength(gravityStrength / 2));
    fg.d3Force('y', d3.forceY(0).strength(gravityStrength / 2));

    fg.d3Force('charge', d3.forceManyBody()
        .strength(chargeStrength)
        .distanceMax(500) 
    );

    fg.d3Force('collide', d3.forceCollide(collisionRadius)
        .radius((node: any) => node.isProject ? 25 : 15)
        .iterations(2)
    );

    fg.d3Force('center', null);

    // fg.d3Reheat();
  }, [data, chargeStrength, gravityStrength, collisionRadius]);

useEffect(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    const fileIds = new Set(files.map(f => f.id));
    const projectNodesSet = new Set<string>();
    const tagNodesSet = new Set<string>();

    files.forEach(file => {
      nodes.push({
        id: file.id,
        name: file.name,
        val: 3,
        color: orbColors[0].replace(/[\d.]+\)$/g, '1)'), 
        isProject: false,
        isTag: false
      } as GraphNode);

      if (showLinks && file.links && Array.isArray(file.links)) {
        file.links.forEach((targetId: string) => {
          if (fileIds.has(targetId)) {
            links.push({
              source: file.id,
              target: targetId,
              isProjectLink: false,
              isTagLink: false
            } as any);
          }
        });
      }

      if (showProjects && file.projectId) {
        if (!projectNodesSet.has(file.projectId)) {
          projectNodesSet.add(file.projectId);
          const projectInfo = projects.find(p => p.id === file.projectId);
          nodes.push({
            id: file.projectId,
            name: projectInfo ? projectInfo.name : "Проект",
            val: 8,
            color: '#ffffff',
            isProject: true,
            isTag: false
          } as GraphNode);
        }
        links.push({ 
          source: file.id, 
          target: file.projectId, 
          isProjectLink: true, 
          isTagLink: false 
        } as any);
      }

      if (showTags) {
        const fileTags = file.tags || file.Tags || [];
        if (Array.isArray(fileTags)) {
          fileTags.forEach((t: any) => {
            const tagName = typeof t === 'string' ? t : (t.decryptedName || t.name); 
            if (!tagName) return;

            const tagId = `tag-${tagName}`;
            if (!tagNodesSet.has(tagId)) {
              tagNodesSet.add(tagId);
              nodes.push({
                id: tagId,
                name: `#${tagName}`,
                val: 5,
                color: orbColors[1].replace(/[\d.]+\)$/g, '1)'),
                isProject: false,
                isTag: true
              } as GraphNode);
            }
            links.push({ source: file.id, target: tagId, isTagLink: true } as any);
          });
        }
      }
    });

    setData({ nodes, links });
  }, [files, projects, showProjects, showTags, showLinks, orbColors]);

  return (
    <Box 
      ref={containerRef} 
      sx={{ 
        width: '100%', 
        height: '100%', 
        bgcolor: '#0808082c',
        overflow: 'hidden'
      }}
    >
      <ForceGraph2D
        width={dimensions.w}
        height={dimensions.h}
        ref={fgRef}
        graphData={data}

        // cooldownTicks={100}
        // onEngineStop={() => fgRef.current.zoomToFit(1800, 200)}
        
        backgroundColor="#0808083a"
        nodeLabel="name"
        nodeColor={node => (node as GraphNode).color || '#fff'}
        nodeRelSize={6}
        
        linkColor={() => 'rgba(255, 255, 255, 0.2)'}
        linkWidth={1}
        
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={2}
        
        onNodeClick={(node: any) => {
          if (!node.isProject) onNodeClick(node.id);
        }}
        
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = (node as GraphNode).name;
          const isProject = node.isProject;
          const isTag = node.isTag;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

          ctx.shadowColor = node.color;
          ctx.shadowBlur = isProject ? 20 : (isTag ? 10 : 5);

          ctx.beginPath();          

          if (isTag) {
            const s = 4; 
            ctx.rect(node.x! - s, node.y! - s, s * 2, s * 2);
          } else {
            const r = isProject ? 8 : 5;
            ctx.arc(node.x!, node.y!, r, 0, 2 * Math.PI, false);
            ctx.fillStyle = (node as GraphNode).color || '#818cf8';
          }
          ctx.fill();

          const offset = isProject ? 14 : 10;
          if (globalScale > 1.5) {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillText(label, node.x!, node.y! + offset);
          }
        }}
      />
      <Paper
        elevation={0}
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: '240px',
          p: 2.5,
          mt: 7,
          borderRadius: 4,
          bgcolor: 'rgba(20, 20, 20, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
          zIndex: 1000
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, letterSpacing: 1 }}>
          ФИЗИКА ГРАФА
        </Typography>
        
        <Stack spacing={3}>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.5 }}>Отталкивание: {chargeStrength}</Typography>
            <Slider 
              size="small" 
              min={-200} max={0} 
              value={chargeStrength} 
              onChange={(_, v) => setChargeStrength(v as number)}
              sx={{ color: orbColors[0].replace(/[\d.]+\)$/g, '1)') }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ opacity: 0.5 }}>Гравитация: {gravityStrength.toFixed(2)}</Typography>
            <Slider 
              size="small" 
              min={0} max={1} step={0.01}
              value={gravityStrength} 
              onChange={(_, v) => setGravityStrength(v as number)}
              sx={{ color: orbColors[0].replace(/[\d.]+\)$/g, '1)') }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ opacity: 0.5 }}>Коллизия: {collisionRadius}</Typography>
            <Slider 
              size="small" 
              min={0} max={50} 
              value={collisionRadius} 
              onChange={(_, v) => setCollisionRadius(v as number)}
              sx={{ color: orbColors[0].replace(/[\d.]+\)$/g, '1)') }}
            />
          </Box>

          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />

          <Box>
            <Typography variant="caption" sx={{ opacity: 0.5 }}>Скорость данных: {particleSpeed.toFixed(3)}</Typography>
            <Slider 
              size="small" 
              min={0} max={0.05} step={0.001}
              value={particleSpeed} 
              onChange={(_, v) => setParticleSpeed(v as number)}
              sx={{ color: orbColors[0].replace(/[\d.]+\)$/g, '1)') }}
            />
          </Box>

          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.05)', mb: 2 }} />

         <Box sx={{ mb: 2 }}>
    <Typography variant="caption" sx={{ opacity: 0.5, display: 'block', mb: 1 }}>ОТОБРАЖЕНИЕ</Typography>
    <Stack direction="row" spacing={1} flexWrap="wrap"> 
        <FormControlLabel
            control={<Checkbox size="small" checked={showProjects} onChange={e => setShowProjects(e.target.checked)} sx={{ color: '#fff', '&.Mui-checked': { color: '#818cf8' } }} />}
            label={<Typography variant="caption">Проекты</Typography>}
        />
        <FormControlLabel
            control={<Checkbox size="small" checked={showTags} onChange={e => setShowTags(e.target.checked)} sx={{ color: '#fff', '&.Mui-checked': { color: orbColors[1] } }} />}
            label={<Typography variant="caption">Теги</Typography>}
        />
        <FormControlLabel
            control={<Checkbox size="small" checked={showLinks} onChange={e => setShowLinks(e.target.checked)} sx={{ color: '#fff', '&.Mui-checked': { color: '#4ade80' } }} />}
            label={<Typography variant="caption">Связи</Typography>}
        />
    </Stack>
</Box>

        </Stack>
      </Paper>
    </Box>
  );
};

export default GraphView;