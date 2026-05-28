import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Stage, Layer, Text as KonvaText, Image as KonvaImage, Transformer, Rect, Line, Group as KonvaGroup } from 'react-konva';
import useImage from 'use-image';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import API from '../api';
import { API_ROOT, API_BASE_URL } from '../config';
import {
  Type,
  Upload,
  Trash2,
  Download,
  Save,
  Layers,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Baseline,
  AlignLeft as AlignLeftIcon,
  AlignCenter as AlignCenterIcon,
  AlignRight as AlignRightIcon,
  AlignJustify,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize,
  RotateCcw,
  RotateCw,
  Lock,
  Unlock,
  Group,
  Ungroup,
  Search,
  MessageSquare,
  History,
  Scissors,
  Layout as LayoutIcon,
  Palette as PaletteIcon,
  FileDown,
  Settings,
  MoreHorizontal,
  Plus,
  Minus,
  Grab,
  MousePointer2,
  FileText,
  Crop,
  Check,
  X,
  Palette
} from 'lucide-react';

function CanvasImage({
  item,
  isSelected,
  onSelect,
  onDragEnd,
  onDragMove,
  onDragStart,
  onTransformEnd,
  onDoubleClick,
  isCropping,
  onCropChange
}) {
  const [image] = useImage(item.src);
  const shapeRef = useRef(null);
  const trRef = useRef(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current && !item.isLocked && !isCropping) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, item.isLocked, isCropping]);

  useEffect(() => {
    if (!shapeRef.current) return;
    const hasFilters =
      item.brightness !== undefined || item.contrast !== undefined || item.grayscale || item.svgColor;
    if (!hasFilters) return;
    
    const timer = setTimeout(() => {
      if (shapeRef.current) {
        shapeRef.current.cache();
        const layer = shapeRef.current.getLayer();
        if (layer) layer.batchDraw();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [item.brightness, item.contrast, item.grayscale, item.svgColor, image]);

  const konvaFilters =
    typeof window !== 'undefined' && window.Konva && window.Konva.Filters
      ? window.Konva.Filters
      : null;

  const filters = [];
  if (konvaFilters) {
    if (item.brightness !== undefined) filters.push(konvaFilters.Brighten);
    if (item.contrast !== undefined) filters.push(konvaFilters.Contrast);
    if (item.grayscale) filters.push(konvaFilters.Grayscale);
    if (item.svgColor) filters.push(konvaFilters.RGBA);
  }

  return (
    <>
      <KonvaImage
        image={image}
        x={item.x}
        y={item.y}
        width={item.width}
        height={item.height}
        rotation={item.rotation || 0}
        opacity={item.opacity !== undefined ? item.opacity : 1}
        scaleX={item.scaleX || 1}
        scaleY={item.scaleY || 1}
        draggable={!item.isLocked && !isCropping}
        ref={shapeRef}
        filters={filters.length ? filters : undefined}
        brightness={item.brightness !== undefined ? item.brightness : 0}
        contrast={item.contrast !== undefined ? item.contrast : 0}
        red={item.svgColor ? parseInt(item.svgColor.slice(1, 3), 16) : undefined}
        green={item.svgColor ? parseInt(item.svgColor.slice(3, 5), 16) : undefined}
        blue={item.svgColor ? parseInt(item.svgColor.slice(5, 7), 16) : undefined}
        alpha={item.svgColor ? 1 : undefined}
        cropX={item.cropX || 0}
        cropY={item.cropY || 0}
        cropWidth={item.cropWidth || (image ? image.width : 0)}
        cropHeight={item.cropHeight || (image ? image.height : 0)}
        onClick={(e) => onSelect(item.id, e.evt)}
        onTap={() => onSelect(item.id)}
        onDragStart={(e) => onDragStart(item.id, e)}
        onDragMove={(e) => onDragMove(item.id, e)}
        onDblClick={() => onDoubleClick && onDoubleClick(item)}
        onDragEnd={(e) => {
          const pos = e.target.position();
          onDragEnd(item.id, pos.x, pos.y);
        }}
        onTransformEnd={() => {
          if (!shapeRef.current) return;
          const node = shapeRef.current;
          const pos = node.position();
          const next = {
            x: pos.x,
            y: pos.y,
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
            rotation: node.rotation(),
            width: node.width(),
            height: node.height()
          };
          onTransformEnd(item.id, next);
        }}
      />
      {isSelected && !item.isLocked && !isCropping && (
        <Transformer 
          ref={trRef} 
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}

function CanvasText({
  item,
  isSelected,
  onSelect,
  onDragEnd,
  onEdit,
  onChange,
  onDragMove,
  onDragStart,
  onTransformEnd
}) {
  const shapeRef = useRef(null);
  const trRef = useRef(null);
  const [backgroundRect, setBackgroundRect] = useState(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current && !item.isLocked) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, item.isLocked]);

  useEffect(() => {
    if (!shapeRef.current || !item.highlightColor) {
      setBackgroundRect(null);
      return;
    }
    const box = shapeRef.current.getClientRect();
    const padding = 4;
    setBackgroundRect({
      x: box.x - padding,
      y: box.y - padding,
      width: box.width + padding * 2,
      height: box.height + padding * 2
    });
  }, [
    item.text,
    item.fontSize,
    item.fontFamily,
    item.fontStyle,
    item.align,
    item.x,
    item.y,
    item.highlightColor,
    item.letterSpacing,
    item.lineHeight
  ]);

  const handleTextDblClick = () => {
    if (item.isLocked) return;
    // Dynamic Placeholder logic
    if (item.text === 'Your Name Here' || item.text === 'Type something...') {
      onChange(item.id, { text: '' });
    }
    onEdit(item.id, item.text);
  };

  const displayText = item.listType === 'bullet' 
    ? item.text.split('\n').map(line => line.trim() ? `• ${line}` : line).join('\n')
    : item.text;

  return (
    <>
      {item.highlightColor && backgroundRect && (
        <Rect
          x={backgroundRect.x}
          y={backgroundRect.y}
          width={backgroundRect.width}
          height={backgroundRect.height}
          fill={item.highlightColor}
          cornerRadius={4}
          listening={false}
        />
      )}
      <KonvaText
        ref={shapeRef}
        text={displayText}
        x={item.x}
        y={item.y}
        fontSize={item.fontSize || 24}
        fontFamily={item.fontFamily || 'system-ui'}
        fontStyle={item.fontStyle || 'normal'}
        align={item.align || 'left'}
        fill={item.fill || '#111827'}
        opacity={item.opacity !== undefined ? item.opacity : 1}
        letterSpacing={item.letterSpacing || 0}
        lineHeight={item.lineHeight || 1.2}
        shadowColor={item.shadowColor}
        shadowBlur={item.shadowBlur}
        shadowOffsetX={item.shadowOffsetX}
        shadowOffsetY={item.shadowOffsetY}
        shadowOpacity={item.shadowOpacity}
        stroke={item.stroke}
        strokeWidth={item.strokeWidth}
        draggable={!item.isLocked}
        onClick={(e) => onSelect(item.id, e.evt)}
        onTap={() => onSelect(item.id)}
        onDragStart={(e) => onDragStart(item.id, e)}
        onDragMove={(e) => onDragMove(item.id, e)}
        onDragEnd={(e) => {
          const pos = e.target.position();
          onDragEnd(item.id, pos.x, pos.y);
        }}
        onDblClick={handleTextDblClick}
        onDblTap={handleTextDblClick}
        onTransformEnd={() => {
          if (!shapeRef.current) return;
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const newFontSize = (item.fontSize || 24) * scaleX;
          node.scaleX(1);
          node.scaleY(1);
          const pos = node.position();
          const next = {
            x: pos.x,
            y: pos.y,
            fontSize: newFontSize,
            rotation: node.rotation()
          };
          onTransformEnd(item.id, next);
        }}
      />
      {isSelected && !item.isLocked && (
        <Transformer 
          ref={trRef}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
        />
      )}
    </>
  );
}

function CanvasCurvedText({
  item,
  isSelected,
  onSelect,
  onDragEnd,
  onEdit,
  onDragMove,
  onDragStart,
  onTransformEnd
}) {
  const shapeRef = useRef(null);
  const trRef = useRef(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current && !item.isLocked) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, item.isLocked]);

  // Curved text implementation using custom shape or group of letters
  // For simplicity in Konva, we can use a custom scene function or just multiple Text nodes
  // Here we use a basic circular arrangement if 'curved' is true
  const radius = item.radius || 100;
  const startAngle = item.startAngle || 0;
  const characters = item.text.split('');
  const anglePerChar = (item.arc || 120) / characters.length;

  return (
    <>
      <KonvaGroup
        ref={shapeRef}
        x={item.x}
        y={item.y}
        draggable={!item.isLocked}
        rotation={item.rotation || 0}
        onClick={(e) => onSelect(item.id, e.evt)}
        onTap={() => onSelect(item.id)}
        onDragStart={(e) => onDragStart(item.id, e)}
        onDragMove={(e) => onDragMove(item.id, e)}
        onDragEnd={(e) => {
          const pos = e.target.position();
          onDragEnd(item.id, pos.x, pos.y);
        }}
      >
        {characters.map((char, i) => {
          const angle = startAngle + i * anglePerChar;
          const charX = radius * Math.cos((angle * Math.PI) / 180);
          const charY = radius * Math.sin((angle * Math.PI) / 180);
          return (
            <KonvaText
              key={i}
              text={char}
              x={charX}
              y={charY}
              fontSize={item.fontSize || 24}
              fontFamily={item.fontFamily || 'system-ui'}
              fill={item.fill || '#111827'}
              rotation={angle + 90}
              align="center"
            />
          );
        })}
      </KonvaGroup>
      {isSelected && !item.isLocked && <Transformer ref={trRef} />}
    </>
  );
}

function CanvasPen({
  item,
  isSelected,
  onSelect,
  onDragEnd,
  onDragMove,
  onDragStart,
  onTransformEnd
}) {
  const shapeRef = useRef(null);
  const trRef = useRef(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current && !item.isLocked) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, item.isLocked]);

  return (
    <>
      <Line
        ref={shapeRef}
        points={item.points || []}
        stroke={item.stroke || '#111827'}
        strokeWidth={item.strokeWidth || 3}
        opacity={item.opacity !== undefined ? item.opacity : 1}
        lineCap="round"
        lineJoin="round"
        draggable={!item.isLocked}
        x={item.x || 0}
        y={item.y || 0}
        onClick={(e) => onSelect(item.id, e.evt)}
        onTap={() => onSelect(item.id)}
        onDragStart={(e) => onDragStart(item.id, e)}
        onDragMove={(e) => onDragMove(item.id, e)}
        onDragEnd={(e) => {
          const pos = e.target.position();
          onDragEnd(item.id, pos.x, pos.y);
        }}
        onTransformEnd={() => {
          if (!shapeRef.current) return;
          const node = shapeRef.current;
          const pos = node.position();
          const next = {
            x: pos.x,
            y: pos.y,
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
            rotation: node.rotation()
          };
          onTransformEnd(item.id, next);
        }}
      />
      {isSelected && !item.isLocked && (
        <Transformer
          ref={trRef}
        />
      )}
    </>
  );
}

function Customizations() {
  const { user } = useAuth();
  const [embedLink, setEmbedLink] = useState('');
  const [showEmbed, setShowEmbed] = useState(false);
  const [items, setItems] = useState([]);
  const [stageSize, setStageSize] = useState({ width: 800, height: 480 });
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [guides, setGuides] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [stockLoading, setStockLoading] = useState(false);
  const [designName, setDesignName] = useState('Untitled Design');
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [savePanelOpen, setSavePanelOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState('elements');
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [showBleedLines, setShowBleedLines] = useState(true);
  const [isPanning, setIsPanning] = useState(false);
  const [showPositionMenu, setShowPositionMenu] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentMode, setCommentMode] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [cropTarget, setCropTarget] = useState(null);
  const [exportMode, setExportMode] = useState('RGB'); // RGB or CMYK
  const [exportDPI, setExportDPI] = useState(300);
  const [activeTool, setActiveTool] = useState('select');
  const [penColor, setPenColor] = useState('#111827');
  const [penSize, setPenSize] = useState(3);

  // History (Undo/Redo) logic
  const pushToHistory = (newItems) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(JSON.stringify(newItems));
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      const nextStep = historyStep - 1;
      setHistoryStep(nextStep);
      setItems(JSON.parse(history[nextStep]));
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      setHistoryStep(nextStep);
      setItems(JSON.parse(history[nextStep]));
    }
  };

  useEffect(() => {
    if (items.length > 0 && historyStep === -1) {
      pushToHistory(items);
    }
  }, [items]);

  const handleItemsChange = (updater) => {
    setItems((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      pushToHistory(next);
      return next;
    });
  };
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const dragStartRef = useRef(null);
  const isDrawingRef = useRef(false);
  const drawingItemIdRef = useRef(null);

  useEffect(() => {
    const resize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      setStageSize({
        width: clientWidth || 1000,
        height: clientHeight || 560
      });
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const key = `printcraft_designs_${user?.id || 'guest'}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        setSavedDesigns(JSON.parse(raw));
      }
    } catch {
      setSavedDesigns([]);
    }
  }, [user]);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        setStockLoading(true);
        const res = await axios.get(`${API_ROOT}/products`);
        const list = Array.isArray(res.data) ? res.data.slice(0, 8) : [];
        setStockItems(list);
      } catch {
        setStockItems([]);
      } finally {
        setStockLoading(false);
      }
    };
    fetchStock();
  }, []);

  const persistDesigns = (designs) => {
    const key = `printcraft_designs_${user?.id || 'guest'}`;
    try {
      localStorage.setItem(key, JSON.stringify(designs));
    } catch {
    }
  };

  useEffect(() => {
    const fetchSavedDesigns = async () => {
      if (!user?.id) return;
      try {
        const res = await axios.get(`${API_ROOT}/creations/user/${user.id}`);
        const serverDesigns = Array.isArray(res.data)
          ? res.data
              .map((product) => {
                const design = product.metadata && product.metadata.designData ? product.metadata.designData : null;
                if (!design) return null;
                return {
                  ...design,
                  id: design.id || product.id,
                  name: design.name || product.name,
                  imageUrl: product.imageUrl,
                  productId: product.id
                };
              })
              .filter(Boolean)
          : [];
        if (serverDesigns.length) {
          setSavedDesigns(serverDesigns);
          persistDesigns(serverDesigns);
        }
      } catch {
      }
    };
    fetchSavedDesigns();
  }, [user]);

  const handleAddText = () => {
    handleItemsChange((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'text',
        text: 'Double-click to edit',
        x: stageSize.width / 2 - 120,
        y: stageSize.height / 2 - 20,
        fontSize: 24,
        fill: getDefaultTextColor(),
        page: currentPage,
        fontFamily: 'system-ui',
        isLocked: false,
        opacity: 1,
        letterSpacing: 0,
        lineHeight: 1.2
      }
    ]);
  };

  const handleAddCurvedText = () => {
    handleItemsChange((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'curvedText',
        text: 'Curved Text Sample',
        x: stageSize.width / 2,
        y: stageSize.height / 2,
        fontSize: 24,
        fill: getDefaultTextColor(),
        page: currentPage,
        radius: 100,
        arc: 120,
        startAngle: -60,
        fontFamily: 'system-ui',
        isLocked: false
      }
    ]);
  };

  const handleTextDragEnd = (id, x, y) => {
    setGuides([]);
    handleItemsChange((prev) => prev.map((item) => (item.id === id ? { ...item, x, y } : item)));
  };

  const handleTextEdit = (id, currentText) => {
    const next = window.prompt('Edit text', currentText);
    if (next !== null) {
      handleItemsChange((prev) => prev.map((item) => (item.id === id ? { ...item, text: next } : item)));
    }
  };

  const handleTextStyleChange = (id, changes) => {
    handleItemsChange((prev) => prev.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  };

  const handleAlign = (alignment) => {
    if (!selectedIds.length) return;
    const stage = stageRef.current;
    if (!stage) return;

    handleItemsChange((prev) =>
      prev.map((item) => {
        if (!selectedIds.includes(item.id)) return item;
        
        let newX = item.x;
        let newY = item.y;
        const width = item.width || (item.fontSize * (item.text?.length || 10) * 0.6); // estimation for text
        const height = item.height || (item.fontSize * 1.2);

        if (alignment === 'left') newX = 0;
        if (alignment === 'center') newX = (stageSize.width - width) / 2;
        if (alignment === 'right') newX = stageSize.width - width;
        if (alignment === 'top') newY = 0;
        if (alignment === 'middle') newY = (stageSize.height - height) / 2;
        if (alignment === 'bottom') newY = stageSize.height - height;

        return { ...item, x: newX, y: newY };
      })
    );
  };

  const getDefaultTextColor = () => {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
      return '#F9FAFB';
    }
    return '#111827';
  };

  const handleUploadImage = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result;
      handleItemsChange((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'image',
          src,
          x: 40,
          y: 40,
          width: 200,
          height: 200,
          page: currentPage,
          isLocked: false,
          opacity: 1,
          rotation: 0
        }
      ]);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleImageDragEnd = (id, x, y) => {
    setGuides([]);
    handleItemsChange((prev) => prev.map((item) => (item.id === id ? { ...item, x, y } : item)));
  };

  const handleImageStyleChange = (id, changes) => {
    handleItemsChange((prev) => prev.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  };

  const handleClearCanvas = () => {
    if (window.confirm('Clear all items from all pages?')) {
      handleItemsChange([]);
      setSelectedIds([]);
    }
  };

  const handleDownload = (format = 'png') => {
    if (!stageRef.current) return;
    const mimeType =
      format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const ext = format === 'jpg' || format === 'jpeg' ? 'jpg' : 'png';
    const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2, mimeType });
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `printcraft-design.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCropDesignToSquare = () => {
    if (!stageRef.current) return;
    const stage = stageRef.current;
    const size = Math.min(stage.width(), stage.height());
    const x = (stage.width() - size) / 2;
    const y = (stage.height() - size) / 2;
    const dataUrl = stage.toDataURL({
      x,
      y,
      width: size,
      height: size,
      pixelRatio: 2
    });
    handleItemsChange([
      {
        id: Date.now(),
        type: 'image',
        src: dataUrl,
        x: 0,
        y: 0,
        width: size,
        height: size,
        page: currentPage,
        isLocked: false,
        opacity: 1
      }
    ]);
    setSelectedIds([]);
  };

  const handleStageDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result;
      handleItemsChange((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'image',
          src,
          x: stageSize.width / 2 - 100,
          y: stageSize.height / 2 - 100,
          width: 200,
          height: 200,
          page: currentPage,
          isLocked: false,
          opacity: 1
        }
      ]);
    };
    reader.readAsDataURL(file);
  };

  const handleItemDragStart = (id, e) => {
    const baseSelected = selectedIds.length ? selectedIds : [id];
    const withGroup = new Set(baseSelected);
    const draggedItem = items.find((item) => item.id === id);
    if (draggedItem && draggedItem.groupId) {
      items
        .filter((item) => item.groupId === draggedItem.groupId)
        .forEach((item) => withGroup.add(item.id));
    }
    const ids = Array.from(withGroup);
    dragStartRef.current = {};
    ids.forEach((itemId) => {
      const item = items.find((x) => x.id === itemId);
      if (item) {
        dragStartRef.current[itemId] = { x: item.x, y: item.y };
      }
    });
    if (!selectedIds.length) {
      setSelectedIds(ids);
    }
    setGuides([]);
  };

  const handleItemDragMove = (id, e) => {
    const stage = stageRef.current;
    if (!stage) return;
    const node = e.target;
    const pos = node.position();
    const stageWidth = stage.width();
    const stageHeight = stage.height();
    const nodeWidth = node.width() * node.scaleX();
    const nodeHeight = node.height() * node.scaleY();
    const centerX = pos.x + nodeWidth / 2;
    const centerY = pos.y + nodeHeight / 2;
    const threshold = 5;
    const nextGuides = [];
    let snappedX = pos.x;
    let snappedY = pos.y;
    if (Math.abs(centerX - stageWidth / 2) < threshold) {
      nextGuides.push({ orientation: 'vertical', position: stageWidth / 2 });
      snappedX = stageWidth / 2 - nodeWidth / 2;
    }
    if (Math.abs(centerY - stageHeight / 2) < threshold) {
      nextGuides.push({ orientation: 'horizontal', position: stageHeight / 2 });
      snappedY = stageHeight / 2 - nodeHeight / 2;
    }
    if (snappedX !== pos.x || snappedY !== pos.y) {
      node.position({ x: snappedX, y: snappedY });
    }
    setGuides(nextGuides);
    if (!dragStartRef.current || selectedIds.length <= 1) return;
    const startPositions = dragStartRef.current;
    const draggedStart = startPositions[id];
    if (!draggedStart) return;
    const dx = snappedX - draggedStart.x;
    const dy = snappedY - draggedStart.y;
    handleItemsChange((prev) =>
      prev.map((item) => {
        if (!selectedIds.includes(item.id) || item.id === id) return item;
        const start = startPositions[item.id];
        if (!start) return item;
        return { ...item, x: start.x + dx, y: start.y + dy };
      })
    );
  };

  const handleTextTransformEnd = (id, attrs) => {
    handleItemsChange((prev) => prev.map((item) => (item.id === id ? { ...item, ...attrs } : item)));
  };

  const handleImageTransformEnd = (id, attrs) => {
    handleItemsChange((prev) => prev.map((item) => (item.id === id ? { ...item, ...attrs } : item)));
  };

  const bringSelectionToFront = () => {
    if (!selectedIds.length) return;
    handleItemsChange((prev) => {
      const remaining = prev.filter((item) => !selectedIds.includes(item.id));
      const selected = prev.filter((item) => selectedIds.includes(item.id));
      return [...remaining, ...selected];
    });
  };

  const sendSelectionToBack = () => {
    if (!selectedIds.length) return;
    handleItemsChange((prev) => {
      const remaining = prev.filter((item) => !selectedIds.includes(item.id));
      const selected = prev.filter((item) => selectedIds.includes(item.id));
      return [...selected, ...remaining];
    });
  };

  const handleGroupSelected = () => {
    if (selectedIds.length < 2) return;
    const groupId = Date.now();
    handleItemsChange((prev) =>
      prev.map((item) => (selectedIds.includes(item.id) ? { ...item, groupId } : item))
    );
  };

  const handleUngroupSelected = () => {
    if (!selectedIds.length) return;
    handleItemsChange((prev) =>
      prev.map((item) => (selectedIds.includes(item.id) ? { ...item, groupId: undefined } : item))
    );
  };

  const handleToggleLockSelected = () => {
    if (!selectedIds.length) return;
    handleItemsChange((prev) =>
      prev.map((item) =>
        selectedIds.includes(item.id) ? { ...item, isLocked: !item.isLocked } : item
      )
    );
  };

  const handleSetAsBackground = () => {
    const primarySelectedId = selectedIds.length ? selectedIds[0] : null;
    if (!primarySelectedId) return;
    const target = items.find((item) => item.id === primarySelectedId && item.type === 'image');
    if (!target) return;
    handleItemsChange((prev) => {
      const others = prev.filter((item) => item.id !== target.id);
      const background = {
        ...target,
        x: 0,
        y: 0,
        width: stageSize.width,
        height: stageSize.height,
        isLocked: true,
        isBackground: true,
        scaleX: 1,
        scaleY: 1,
        rotation: 0
      };
      return [background, ...others];
    });
  };

  const handleOpacityChange = (id, value) => {
    handleItemsChange((prev) =>
      prev.map((item) => (item.id === id ? { ...item, opacity: value } : item))
    );
  };

  const handleAddStockImage = (product) => {
    const src = product.imageUrl || product.image;
    if (!src) return;
    handleItemsChange((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'image',
        src,
        x: stageSize.width / 2 - 100,
        y: stageSize.height / 2 - 100,
        width: 200,
        height: 200,
        page: currentPage,
        isLocked: false,
        opacity: 1
      }
    ]);
  };

  const handleSaveDesign = async () => {
    if (!stageRef.current) return;
    setSaveStatus('saving');
    const timestamp = Date.now();
    const payload = {
      id: `DESIGN-${timestamp}`,
      name: designName || 'Untitled Design',
      items,
      stageSize,
      pageCount: totalPages,
      userId: user?.id || 'guest',
      createdAt: new Date().toISOString()
    };
    try {
      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
      const blob = await fetch(dataUrl).then((res) => res.blob());
      const formData = new FormData();
      formData.append('image', blob, `design-${timestamp}.png`);
      const uploadRes = await axios.post(
        `${API_ROOT}/upload/image`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      const rawImageUrl = uploadRes.data.imageUrl;
      const imageUrl =
        typeof rawImageUrl === 'string' && rawImageUrl.startsWith('http')
          ? rawImageUrl
          : `${API_BASE_URL}${rawImageUrl}`;
      await axios.post(`${API_ROOT}/products`, {
        id: payload.id,
        sellerId: user?.id || 'CUSTOM-EDITOR',
        name: payload.name,
        description: 'Customized design created in Rong-Tuli editor',
        price: 0,
        color: 'custom',
        stock: 'in-stock',
        imageUrl,
        category: 'customization',
        metadata: {
          customized: true,
          designData: payload
        }
      });
      const filtered = savedDesigns.filter((d) => d.name !== payload.name);
      const next = [...filtered, payload];
      setSavedDesigns(next);
      persistDesigns(next);
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error saving design', error);
      setSaveStatus('error');
    }
  };

  const handleLoadDesign = (design) => {
    const loadedItems = (design.items || []).map((item) => ({
      page: 1,
      ...item
    }));
    setItems(loadedItems);
    const maxPage =
      loadedItems.length > 0
        ? loadedItems.reduce((max, item) => Math.max(max, item.page || 1), 1)
        : 1;
    setTotalPages(maxPage);
    setCurrentPage(1);
    if (design.stageSize) {
      setStageSize(design.stageSize);
    }
    setSelectedIds([]);
    setStageScale(1);
    setStagePosition({ x: 0, y: 0 });
  };

  const primarySelectedId = selectedIds.length ? selectedIds[0] : null;
  const selectedItem =
    items.find(
      (item) =>
        item.id === primarySelectedId && (item.page || 1) === currentPage
    ) || null;

  const handleSelectItem = (id, evt) => {
    if (evt && (evt.shiftKey || evt.ctrlKey || evt.metaKey)) {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((existingId) => existingId !== id) : [...prev, id]
      );
    } else {
      setSelectedIds([id]);
    }
  };

  const handleStageMouseDown = (e) => {
    const stage = e.target.getStage();
    if (!stage) return;
    
    if (commentMode) {
      const pos = stage.getPointerPosition();
      const text = window.prompt('Enter comment:');
      if (text) {
        setComments(prev => [...prev, {
          id: Date.now(),
          text,
          x: (pos.x - stagePosition.x) / stageScale,
          y: (pos.y - stagePosition.y) / stageScale,
          page: currentPage
        }]);
      }
      setCommentMode(false);
      return;
    }

    if (activeTool === 'pen') {
      const pos = stage.getPointerPosition();
      if (!pos) return;
      const x = (pos.x - stagePosition.x) / stageScale;
      const y = (pos.y - stagePosition.y) / stageScale;
      const id = Date.now();
      const newLine = {
        id,
        type: 'pen',
        points: [x, y],
        stroke: penColor,
        strokeWidth: penSize,
        opacity: 1,
        page: currentPage,
        isLocked: false
      };
      isDrawingRef.current = true;
      drawingItemIdRef.current = id;
      setItems((prev) => {
        const next = [...prev, newLine];
        pushToHistory(next);
        return next;
      });
      setSelectedIds([id]);
      setGuides([]);
      return;
    }

    if (e.target === stage) {
      setSelectedIds([]);
    }
  };

  const handleStageMouseMove = () => {
    if (!isDrawingRef.current || activeTool !== 'pen') return;
    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;
    const x = (pos.x - stagePosition.x) / stageScale;
    const y = (pos.y - stagePosition.y) / stageScale;
    const id = drawingItemIdRef.current;
    if (!id) return;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const points = item.points || [];
        return { ...item, points: [...points, x, y] };
      })
    );
  };

  const handleStageMouseUp = () => {
    if (isDrawingRef.current && activeTool === 'pen') {
      isDrawingRef.current = false;
      drawingItemIdRef.current = null;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedIds.length) return;
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
        setSelectedIds([]);
        return;
      }

      // Nudging logic
      const nudgeAmount = e.shiftKey ? 10 : 1;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        handleItemsChange((prev) =>
          prev.map((item) => {
            if (!selectedIds.includes(item.id)) return item;
            let { x, y } = item;
            if (e.key === 'ArrowLeft') x -= nudgeAmount;
            if (e.key === 'ArrowRight') x += nudgeAmount;
            if (e.key === 'ArrowUp') y -= nudgeAmount;
            if (e.key === 'ArrowDown') y += nudgeAmount;
            return { ...item, x, y };
          })
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds]);

  const handleZoom = (direction) => {
    const scaleBy = 1.1;
    setStageScale((prev) => {
      const next = direction === 'in' ? prev * scaleBy : prev / scaleBy;
      if (next < 0.2) return 0.2;
      if (next > 5) return 5;
      return next;
    });
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stagePosition.x) / oldScale,
      y: (pointer.y - stagePosition.y) / oldScale
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const scaleBy = 1.1; // Slightly faster zoom
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // Remove restrictive zoom limits for "Infinite" feel, but keep a reasonable range
    if (newScale < 0.05 || newScale > 20) return;

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale
    };

    setStageScale(newScale);
    setStagePosition(newPos);
  };

  const handleStageDragEnd = (e) => {
    const stage = e.target.getStage();
    if (!stage) return;
    setStagePosition(stage.position());
  };

  const handleStageDragMove = (e) => {
    if (!isPanning && !e.evt?.spaceKey) return;
    const stage = e.target.getStage();
    if (e.target === stage) {
      setStagePosition(stage.position());
    }
  };

  const handleTogglePan = () => {
    setIsPanning(!isPanning);
  };

  // Spacebar for panning
  useEffect(() => {
    const handleDown = (e) => {
      if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT') {
        setIsPanning(true);
      }
    };
    const handleUp = (e) => {
      if (e.code === 'Space') {
        setIsPanning(false);
      }
    };
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, []);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setSelectedIds([]);
  };

  const handleImageDoubleClick = (item) => {
    if (item.type === 'image') {
      setIsCropping(true);
      setCropTarget(item.id);
      setSelectedIds([item.id]);
    }
  };

  const handleCropExit = () => {
    setIsCropping(false);
    setCropTarget(null);
  };

  const handleCropSave = (id, cropData) => {
    handleItemsChange((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...cropData } : item))
    );
    handleCropExit();
  };

  const handleUploadImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleCopySelected = () => {
    if (!selectedIds.length) return;
    const selected = items.filter((item) => selectedIds.includes(item.id));
    const copies = selected.map((item) => ({
      ...item,
      id: Date.now() + Math.random(),
      x: item.x + 20,
      y: item.y + 20,
      groupId: undefined
    }));
    handleItemsChange((prev) => [...prev, ...copies]);
  };

  const handleDuplicatePage = () => {
    const pageItems = items.filter((item) => (item.page || 1) === currentPage);
    const copies = pageItems.map((item) => ({
      ...item,
      id: Date.now() + Math.random(),
      page: totalPages + 1
    }));
    setTotalPages((prev) => prev + 1);
    setItems((prev) => [...prev, ...copies]);
    setCurrentPage(totalPages + 1);
  };

  const handleToggleGuides = () => {
    setShowBleedLines(!showBleedLines);
  };

  const handleExportHighDPI = async (format = 'png') => {
    if (!stageRef.current) return;
    const stage = stageRef.current;
    
    // Scale up for high DPI
    const pixelRatio = exportDPI / 72;
    const dataUrl = stage.toDataURL({ 
      pixelRatio,
      mimeType: format === 'png' ? 'image/png' : 'image/jpeg',
      quality: 1
    });

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${designName}-${exportMode}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [exportFormat, setExportFormat] = useState('png');

  // Auto-Save feature
  useEffect(() => {
    if (items.length === 0) return;
    
    const autoSaveTimer = setInterval(() => {
      console.log('Auto-saving design...');
      handleSaveDesign();
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveTimer);
  }, [items, designName]);

  const handleColorExtraction = async () => {
    const firstImage = items.find(it => it.type === 'image' && (it.page || 1) === currentPage);
    if (!firstImage) {
      alert('Please add an image to extract colors from.');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = firstImage.src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      
      const colors = {};
      for (let i = 0; i < imageData.length; i += 400) { // Sample every 100th pixel
        const r = imageData[i];
        const g = imageData[i+1];
        const b = imageData[i+2];
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        colors[hex] = (colors[hex] || 0) + 1;
      }
      
      const sortedColors = Object.entries(colors)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(c => c[0]);
        
      alert(`Extracted colors: ${sortedColors.join(', ')}`);
      // You could update a state variable here to show these colors in the UI
    };
  };

  const handleExportPDF = async () => {
    if (!stageRef.current) return;
    const stage = stageRef.current;
    
    // Use high DPI for PDF export
    const pixelRatio = 300 / 72;
    const dataUrl = stage.toDataURL({ pixelRatio });
    
    const pdf = new jsPDF({
      orientation: stageSize.width > stageSize.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [stageSize.width, stageSize.height]
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, stageSize.width, stageSize.height);
    pdf.save(`${designName}.pdf`);
  };

  return (
    <Layout userType={user?.userType || 'user'}>
      <div className="flex flex-col h-screen bg-[#F0F2F5] dark:bg-[#0F0F0F] overflow-hidden">
        {/* Top Bar */}
        <div className="h-14 bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 z-50">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <ChevronLeft size={20} />
            </button>
            <div className="flex flex-col">
              <input
                type="text"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                className="bg-transparent font-bold text-sm focus:outline-none border-b border-transparent hover:border-gray-300 focus:border-rose-500 transition px-1"
              />
              <span className="text-[10px] text-gray-500 px-1">
                {saveStatus === 'saved' ? 'All changes saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved changes'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mr-4">
              <button
                onClick={undo}
                disabled={historyStep <= 0}
                className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded shadow-sm disabled:opacity-30"
                title="Undo (Ctrl+Z)"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={redo}
                disabled={historyStep >= history.length - 1}
                className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded shadow-sm disabled:opacity-30"
                title="Redo (Ctrl+Y)"
              >
                <RotateCw size={16} />
              </button>
            </div>

            <button
              onClick={() => setCommentMode(!commentMode)}
              className={`p-2 rounded-lg transition ${commentMode ? 'bg-rose-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
              title="Add Comment"
            >
              <MessageSquare size={20} />
            </button>

            <div className="relative">
              <button
                onClick={() => setSavePanelOpen(!savePanelOpen)}
                className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition shadow-lg shadow-rose-500/20"
              >
                <Download size={16} /> Export
              </button>

              {savePanelOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-[#1A1A1A] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 p-4 z-[100]">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <FileDown size={16} /> Download Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">File Type</label>
                      <select 
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-xs p-2"
                      >
                        <option value="png">PNG (Suggested)</option>
                        <option value="jpg">JPG</option>
                        <option value="pdf">PDF Print</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Color Mode</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setExportMode('RGB')}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                            exportMode === 'RGB' ? 'bg-rose-50 border-rose-500 text-rose-600' : 'border-gray-200'
                          }`}
                        >
                          RGB (Digital)
                        </button>
                        <button
                          onClick={() => setExportMode('CMYK')}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                            exportMode === 'CMYK' ? 'bg-rose-50 border-rose-500 text-rose-600' : 'border-gray-200'
                          }`}
                        >
                          CMYK (Print)
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1 flex justify-between">
                        <span>Quality (DPI)</span>
                        <span>{exportDPI} DPI</span>
                      </label>
                      <input
                        type="range"
                        min="72"
                        max="300"
                        step="1"
                        value={exportDPI}
                        onChange={(e) => setExportDPI(Number(e.target.value))}
                        className="w-full accent-rose-500"
                      />
                    </div>
                    <button
                      onClick={() => exportFormat === 'pdf' ? handleExportPDF() : handleExportHighDPI(exportFormat)}
                      className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-2 rounded-lg text-xs font-bold hover:opacity-90 transition"
                    >
                      Download Design
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
          {/* Main Sidebar (Tabs) */}
          <div className="w-[72px] bg-[#18191B] flex flex-col items-center py-4 gap-4 z-40">
            {[
              { id: 'elements', icon: LayoutIcon, label: 'Elements' },
              { id: 'text', icon: Type, label: 'Text' },
              { id: 'uploads', icon: Upload, label: 'Uploads' },
              { id: 'stock', icon: ImageIcon, label: 'Products' },
              { id: 'history', icon: History, label: 'History' },
              { id: 'layers', icon: Layers, label: 'Layers' },
              { id: 'comments', icon: MessageSquare, label: 'Comments' },
              { id: 'settings', icon: Settings, label: 'Settings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSidebarTab(tab.id);
                  setSidebarOpen(true);
                }}
                className={`flex flex-col items-center gap-1 group transition-all ${
                  activeSidebarTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className={`p-2 rounded-xl transition-all ${
                  activeSidebarTab === tab.id ? 'bg-white/10 shadow-lg' : 'group-hover:bg-white/5'
                }`}>
                  <tab.icon size={20} />
                </div>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Secondary Sidebar (Content) */}
          {sidebarOpen && (
            <div className="w-80 bg-white dark:bg-[#1E1E1E] border-r border-gray-200 dark:border-gray-800 flex flex-col z-30 shadow-xl">
              <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-black text-sm uppercase tracking-widest">{activeSidebarTab}</h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeSidebarTab === 'elements' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] uppercase font-black text-gray-400 mb-3 tracking-wider">Brand Colors</h4>
                      <div className="flex flex-wrap gap-2">
                        {['#E11D48', '#F43F5E', '#FB7185', '#FDA4AF', '#FECDD3', '#FFF1F2', '#111827', '#4B5563'].map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              if (selectedItem) {
                                handleTextStyleChange(selectedItem.id, { fill: color });
                              }
                            }}
                            className="w-8 h-8 rounded-lg shadow-sm border border-gray-100 transition hover:scale-110"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] uppercase font-black text-gray-400 mb-3 tracking-wider">Canvas Helpers</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleToggleGuides}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition ${
                            showBleedLines ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <Maximize size={20} />
                          <span className="text-[10px] font-bold">Safe Zones</span>
                        </button>
                        <button
                          onClick={handleCropDesignToSquare}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-gray-100 hover:border-gray-200 transition"
                        >
                          <Scissors size={20} />
                          <span className="text-[10px] font-bold">Auto Crop</span>
                        </button>
                        <button
                          onClick={handleColorExtraction}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-gray-100 hover:border-gray-200 transition"
                        >
                          <Palette size={20} className="text-rose-500" />
                          <span className="text-[10px] font-bold">Extract Colors</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSidebarTab === 'text' && (
                  <div className="space-y-4">
                    <button
                      onClick={handleAddText}
                      className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition"
                    >
                      <Plus size={16} /> Add a text box
                    </button>
                    <button
                      onClick={handleAddCurvedText}
                      className="w-full py-3 bg-rose-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition"
                    >
                      <RotateCw size={16} /> Add curved text
                    </button>
                  </div>
                )}

                {activeSidebarTab === 'uploads' && (
                  <div className="space-y-4">
                    <button
                      onClick={handleUploadImageClick}
                      className="w-full py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center gap-2 hover:border-rose-500 transition-all bg-gray-50 dark:bg-gray-800/50 group"
                    >
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-md group-hover:scale-110 transition-transform">
                        <Upload className="text-rose-500" size={24} />
                      </div>
                      <span className="text-xs font-bold">Upload files</span>
                      <span className="text-[10px] text-gray-400">Drag & drop or click</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleUploadImage} className="hidden" accept="image/*" />
                  </div>
                )}

                {activeSidebarTab === 'stock' && (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        type="text"
                        placeholder="Search stock photos..."
                        value={stockSearchQuery}
                        onChange={(e) => setStockSearchQuery(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-lg py-2 pl-9 pr-4 text-xs focus:ring-2 ring-rose-500/20"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {stockItems
                        .filter(item => 
                          item.name?.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
                          item.category?.toLowerCase().includes(stockSearchQuery.toLowerCase())
                        )
                        .map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleAddStockImage(item)}
                          className="group relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden hover:ring-2 ring-rose-500 transition-all"
                        >
                          <img
                            src={item.imageUrl || item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[10px] text-white font-bold truncate">{item.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeSidebarTab === 'history' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Recent Changes</h4>
                      <span className="text-[10px] font-bold text-rose-500">{history.length} states</span>
                    </div>
                    <div className="space-y-2">
                      {history.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setHistoryStep(index);
                            setItems(JSON.parse(history[index]));
                          }}
                          className={`w-full text-left p-3 rounded-xl border transition flex items-center gap-3 ${
                            historyStep === index ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${historyStep === index ? 'bg-rose-500' : 'bg-gray-300'}`} />
                          <div className="flex-1">
                            <p className="text-[10px] font-bold">Version {index + 1}</p>
                            <p className="text-[8px] text-gray-400 uppercase tracking-widest">
                              {index === historyStep ? 'Current State' : index < historyStep ? 'Past' : 'Future'}
                            </p>
                          </div>
                          {index === historyStep && <History size={14} />}
                        </button>
                      )).reverse()}
                    </div>
                  </div>
                )}

                {activeSidebarTab === 'layers' && (
                  <div className="space-y-2">
                    {[...items].reverse().map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedIds([item.id])}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                          selectedIds.includes(item.id) ? 'bg-rose-50 dark:bg-rose-500/10 border border-rose-200' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center overflow-hidden">
                          {item.type === 'text' ? (
                            <Type size={16} />
                          ) : item.type === 'image' && item.src ? (
                            <img src={item.src} className="w-full h-full object-cover" />
                          ) : (
                            <FileText size={16} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold truncate">
                            {item.type === 'text'
                              ? item.text
                              : item.type === 'image'
                              ? 'Image Layer'
                              : 'Drawing'}
                          </p>
                          <p className="text-[8px] text-gray-400 uppercase tracking-widest">{item.type}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleLockSelected();
                          }}
                          className={`p-1.5 rounded transition ${item.isLocked ? 'text-rose-500' : 'text-gray-400'}`}
                        >
                          {item.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col relative overflow-hidden bg-[#E3E6E9] dark:bg-[#000]">
            {/* Cropping UI Overlay */}
            {isCropping && cropTarget && (
              <div className="absolute inset-x-0 top-0 h-16 bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-gray-800 z-[100] flex items-center justify-between px-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Crop size={18} className="text-rose-500" />
                    Adjust Crop
                  </h3>
                  <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    Adjust the crop area using sliders
                  </p>
                </div>
                
                <div className="flex items-center gap-6">
                  {items.filter(it => it.id === cropTarget).map(targetItem => (
                    <div key={targetItem.id} className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black text-gray-400 uppercase">Crop X/Y</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="range" min="0" max="2000" step="1" 
                            value={targetItem.cropX || 0}
                            onChange={(e) => handleItemsChange(prev => prev.map(it => it.id === cropTarget ? {...it, cropX: Number(e.target.value)} : it))}
                            className="w-20 h-1 accent-rose-500"
                          />
                          <input 
                            type="range" min="0" max="2000" step="1" 
                            value={targetItem.cropY || 0}
                            onChange={(e) => handleItemsChange(prev => prev.map(it => it.id === cropTarget ? {...it, cropY: Number(e.target.value)} : it))}
                            className="w-20 h-1 accent-rose-500"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black text-gray-400 uppercase">Crop Size</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="range" min="10" max="2000" step="1" 
                            value={targetItem.cropWidth || 500}
                            onChange={(e) => handleItemsChange(prev => prev.map(it => it.id === cropTarget ? {...it, cropWidth: Number(e.target.value)} : it))}
                            className="w-20 h-1 accent-rose-500"
                          />
                          <input 
                            type="range" min="10" max="2000" step="1" 
                            value={targetItem.cropHeight || 500}
                            onChange={(e) => handleItemsChange(prev => prev.map(it => it.id === cropTarget ? {...it, cropHeight: Number(e.target.value)} : it))}
                            className="w-20 h-1 accent-rose-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={handleCropExit}
                      className="h-9 px-4 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2"
                    >
                      <X size={14} /> Cancel
                    </button>
                    <button
                      onClick={handleCropExit}
                      className="h-9 px-6 rounded-lg text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 transition shadow-md shadow-rose-200 flex items-center gap-2"
                    >
                      <Check size={14} /> Done
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Contextual Toolbar */}
            {selectedItem && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 h-10 bg-white dark:bg-[#1A1A1A] rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 flex items-center px-2 gap-1 z-20">
                {selectedItem.type === 'text' && (
                  <>
                    <button className="h-7 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs font-bold flex items-center gap-2 min-w-[100px] justify-between border-r border-gray-100">
                      <span>{selectedItem.fontFamily || 'Default'}</span>
                      <ChevronRight size={12} className="rotate-90" />
                    </button>
                    
                    <div className="flex items-center gap-1 px-1 border-r border-gray-100">
                      <button
                        onClick={() => handleTextStyleChange(selectedItem.id, { fontSize: (selectedItem.fontSize || 24) - 1 })}
                        className="w-7 h-7 hover:bg-gray-100 rounded flex items-center justify-center"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="text"
                        value={Math.round(selectedItem.fontSize || 24)}
                        onChange={(e) => handleTextStyleChange(selectedItem.id, { fontSize: Number(e.target.value) || 24 })}
                        className="w-10 text-center text-xs font-bold bg-transparent"
                      />
                      <button
                        onClick={() => handleTextStyleChange(selectedItem.id, { fontSize: (selectedItem.fontSize || 24) + 1 })}
                        className="w-7 h-7 hover:bg-gray-100 rounded flex items-center justify-center"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-1 px-1 border-r border-gray-100">
                      <input
                        type="color"
                        value={selectedItem.fill || '#111827'}
                        onChange={(e) => handleTextStyleChange(selectedItem.id, { fill: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer border-none p-0 bg-transparent"
                      />
                    </div>

                    <div className="flex items-center gap-1 px-1 border-r border-gray-100">
                      <button
                        onClick={() => handleTextStyleChange(selectedItem.id, { fontStyle: selectedItem.fontStyle === 'bold' ? 'normal' : 'bold' })}
                        className={`w-7 h-7 rounded flex items-center justify-center ${selectedItem.fontStyle === 'bold' ? 'bg-rose-50 text-rose-500' : 'hover:bg-gray-100'}`}
                      >
                        <Bold size={14} />
                      </button>
                      <button
                        onClick={() => handleTextStyleChange(selectedItem.id, { fontStyle: selectedItem.fontStyle === 'italic' ? 'normal' : 'italic' })}
                        className={`w-7 h-7 rounded flex items-center justify-center ${selectedItem.fontStyle === 'italic' ? 'bg-rose-50 text-rose-500' : 'hover:bg-gray-100'}`}
                      >
                        <Italic size={14} />
                      </button>
                      <button
                        onClick={() => {
                          const alignments = ['left', 'center', 'right'];
                          const current = selectedItem.align || 'left';
                          const next = alignments[(alignments.indexOf(current) + 1) % alignments.length];
                          handleTextStyleChange(selectedItem.id, { align: next });
                        }}
                        className="w-7 h-7 hover:bg-gray-100 rounded flex items-center justify-center"
                      >
                        {selectedItem.align === 'center' ? <AlignCenterIcon size={14} /> : selectedItem.align === 'right' ? <AlignRightIcon size={14} /> : <AlignLeftIcon size={14} />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 px-2 border-r border-gray-100">
                      <div className="flex flex-col">
                        <span className="text-[7px] uppercase font-black text-gray-400 leading-none">Spacing</span>
                        <div className="flex items-center gap-1">
                          <Baseline size={10} className="text-gray-400" />
                          <input
                            type="range"
                            min="-5"
                            max="20"
                            step="0.5"
                            value={selectedItem.letterSpacing || 0}
                            onChange={(e) => handleTextStyleChange(selectedItem.id, { letterSpacing: Number(e.target.value) })}
                            className="w-12 h-1 accent-rose-500"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[7px] uppercase font-black text-gray-400 leading-none">Height</span>
                        <div className="flex items-center gap-1">
                          <Baseline size={10} className="text-gray-400" />
                          <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.1"
                            value={selectedItem.lineHeight || 1.2}
                            onChange={(e) => handleTextStyleChange(selectedItem.id, { lineHeight: Number(e.target.value) })}
                            className="w-12 h-1 accent-rose-500"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 border-r border-gray-100">
                      <button
                        onClick={() => handleTextStyleChange(selectedItem.id, { listType: selectedItem.listType === 'bullet' ? null : 'bullet' })}
                        className={`w-7 h-7 flex items-center justify-center rounded transition ${selectedItem.listType === 'bullet' ? 'bg-rose-50 text-rose-500' : 'hover:bg-gray-100'}`}
                        title="Bullet List"
                      >
                        <AlignJustify size={14} />
                      </button>
                      <button
                        onClick={() => {
                          const fileInput = document.createElement('input');
                          fileInput.type = 'file';
                          fileInput.accept = '.ttf,.otf,.woff,.woff2';
                          fileInput.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = async (event) => {
                                const fontName = file.name.split('.')[0];
                                const fontData = event.target.result;
                                const fontFace = new FontFace(fontName, fontData);
                                try {
                                  const loadedFace = await fontFace.load();
                                  document.fonts.add(loadedFace);
                                  handleTextStyleChange(selectedItem.id, { fontFamily: fontName });
                                  alert(`Font "${fontName}" uploaded successfully!`);
                                } catch (err) {
                                  alert('Failed to load font. Please use a valid font file.');
                                }
                              };
                              reader.readAsArrayBuffer(file);
                            }
                          };
                          fileInput.click();
                        }}
                        className="h-7 px-2 hover:bg-gray-100 rounded text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1"
                      >
                        <Upload size={12} /> Font
                      </button>
                    </div>
                  </>
                )}
                
                {selectedItem.type === 'image' && (
                  <div className="flex items-center gap-4 px-2 border-r border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-[7px] uppercase font-black text-gray-400 leading-none">Brightness</span>
                      <input
                        type="range"
                        min="-1"
                        max="1"
                        step="0.1"
                        value={selectedItem.brightness || 0}
                        onChange={(e) => handleImageStyleChange(selectedItem.id, { brightness: Number(e.target.value) })}
                        className="w-16 h-1 accent-rose-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[7px] uppercase font-black text-gray-400 leading-none">Contrast</span>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        step="1"
                        value={selectedItem.contrast || 0}
                        onChange={(e) => handleImageStyleChange(selectedItem.id, { contrast: Number(e.target.value) })}
                        className="w-16 h-1 accent-rose-500"
                      />
                    </div>
                    <button
                      onClick={() => handleImageStyleChange(selectedItem.id, { grayscale: !selectedItem.grayscale })}
                      className={`h-7 px-2 text-[10px] font-bold rounded flex items-center gap-1 transition ${selectedItem.grayscale ? 'bg-rose-50 text-rose-500' : 'hover:bg-gray-100'}`}
                    >
                      B&W
                    </button>
                    {selectedItem.src?.toLowerCase().endsWith('.svg') && (
                      <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
                        <span className="text-[7px] uppercase font-black text-gray-400">SVG Color</span>
                        <input
                          type="color"
                          value={selectedItem.svgColor || '#000000'}
                          onChange={(e) => handleImageStyleChange(selectedItem.id, { svgColor: e.target.value })}
                          className="w-5 h-5 rounded-full border-none cursor-pointer"
                        />
                      </div>
                    )}
                    <button
                      onClick={() => handleImageDoubleClick(selectedItem)}
                      className="h-7 px-2 text-[10px] font-bold rounded flex items-center gap-1 bg-gray-100 hover:bg-gray-200"
                    >
                      <Crop size={12} /> Crop
                    </button>
                    <button
                      onClick={() =>
                        alert(
                          'Background removal requires API integration (e.g., Remove.bg). Please contact support for setup.'
                        )
                      }
                      className="h-7 px-2 text-[10px] font-bold rounded flex items-center gap-1 bg-gray-900 text-white hover:opacity-90 transition"
                    >
                      <Layers size={12} /> Remove BG
                    </button>
                  </div>
                )}

                {selectedItem.type === 'pen' && (
                  <div className="flex items-center gap-4 px-2 border-r border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-[7px] uppercase font-black text-gray-400 leading-none">Stroke</span>
                      <input
                        type="color"
                        value={selectedItem.stroke || '#111827'}
                        onChange={(e) => {
                          setPenColor(e.target.value);
                          handleItemsChange((prev) =>
                            prev.map((it) =>
                              it.id === selectedItem.id ? { ...it, stroke: e.target.value } : it
                            )
                          );
                        }}
                        className="w-6 h-6 rounded cursor-pointer border-none p-0 bg-transparent"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[7px] uppercase font-black text-gray-400 leading-none">Thickness</span>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="1"
                        value={selectedItem.strokeWidth || 3}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setPenSize(value);
                          handleItemsChange((prev) =>
                            prev.map((it) =>
                              it.id === selectedItem.id ? { ...it, strokeWidth: value } : it
                            )
                          );
                        }}
                        className="w-20 h-1 accent-rose-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[7px] uppercase font-black text-gray-400 leading-none">Opacity</span>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={selectedItem.opacity !== undefined ? selectedItem.opacity : 1}
                        onChange={(e) =>
                          handleItemsChange((prev) =>
                            prev.map((it) =>
                              it.id === selectedItem.id
                                ? { ...it, opacity: Number(e.target.value) }
                                : it
                            )
                          )
                        }
                        className="w-20 h-1 accent-rose-500"
                      />
                    </div>
                  </div>
                )}

                {selectedItem.type === 'curvedText' && (
                  <div className="flex items-center gap-4 px-2">
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase font-bold text-gray-400">Radius</span>
                      <input
                        type="range"
                        min="50"
                        max="300"
                        value={selectedItem.radius || 100}
                        onChange={(e) => handleTextStyleChange(selectedItem.id, { radius: Number(e.target.value) })}
                        className="w-20 accent-rose-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase font-bold text-gray-400">Arc</span>
                      <input
                        type="range"
                        min="30"
                        max="360"
                        value={selectedItem.arc || 120}
                        onChange={(e) => handleTextStyleChange(selectedItem.id, { arc: Number(e.target.value) })}
                        className="w-20 accent-rose-500"
                      />
                    </div>
                  </div>
                )}

                <div className="w-px h-6 bg-gray-100 mx-1" />
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleItemsChange(prev => prev.map(it => it.id === selectedItem.id ? { ...it, isLocked: !it.isLocked } : it))}
                    className={`w-7 h-7 flex items-center justify-center rounded transition ${selectedItem.isLocked ? 'bg-rose-50 text-rose-500' : 'hover:bg-gray-100'}`}
                    title={selectedItem.isLocked ? "Unlock" : "Lock"}
                  >
                    {selectedItem.isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>
                  {selectedIds.length > 1 && (
                    <button
                      onClick={handleGroupSelected}
                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition"
                      title="Group"
                    >
                      <Group size={14} />
                    </button>
                  )}
                  {selectedItem.groupId && (
                    <button
                      onClick={handleUngroupSelected}
                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition"
                      title="Ungroup"
                    >
                      <Ungroup size={14} />
                    </button>
                  )}
                </div>

                <div className="w-px h-6 bg-gray-100 mx-1" />
                
                <div className="flex items-center gap-1 relative">
                  <button
                    onClick={() => setShowPositionMenu(!showPositionMenu)}
                    className={`h-7 px-2 text-[10px] font-bold rounded flex items-center gap-1 transition ${showPositionMenu ? 'bg-rose-50 text-rose-500' : 'hover:bg-gray-100'}`}
                  >
                    Position
                  </button>

                  {showPositionMenu && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#1A1A1A] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 p-2 z-[110]">
                      <div className="grid grid-cols-2 gap-1 mb-2">
                        <button onClick={() => { handleAlign('left'); setShowPositionMenu(false); }} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-[10px] font-bold">
                          <AlignLeftIcon size={14} /> Left
                        </button>
                        <button onClick={() => { handleAlign('center'); setShowPositionMenu(false); }} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-[10px] font-bold">
                          <AlignCenterIcon size={14} /> Center
                        </button>
                        <button onClick={() => { handleAlign('right'); setShowPositionMenu(false); }} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-[10px] font-bold">
                          <AlignRightIcon size={14} /> Right
                        </button>
                        <div className="h-px bg-gray-100 dark:bg-gray-800 col-span-2 my-1" />
                        <button onClick={() => { handleAlign('top'); setShowPositionMenu(false); }} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-[10px] font-bold">
                          <ArrowUp size={14} /> Top
                        </button>
                        <button onClick={() => { handleAlign('middle'); setShowPositionMenu(false); }} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-[10px] font-bold">
                          <AlignCenterIcon size={14} /> Middle
                        </button>
                        <button onClick={() => { handleAlign('bottom'); setShowPositionMenu(false); }} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-[10px] font-bold">
                          <ArrowDown size={14} /> Bottom
                        </button>
                      </div>
                      <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
                      <div className="grid grid-cols-2 gap-2 p-1">
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] uppercase font-black text-gray-400">X Position</span>
                          <input
                            type="number"
                            value={Math.round(selectedItem.x)}
                            onChange={(e) => handleTextStyleChange(selectedItem.id, { x: Number(e.target.value) })}
                            className="bg-gray-50 dark:bg-gray-800 border-none rounded p-1 text-[10px] font-bold"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] uppercase font-black text-gray-400">Y Position</span>
                          <input
                            type="number"
                            value={Math.round(selectedItem.y)}
                            onChange={(e) => handleTextStyleChange(selectedItem.id, { y: Number(e.target.value) })}
                            className="bg-gray-50 dark:bg-gray-800 border-none rounded p-1 text-[10px] font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="w-px h-6 bg-gray-100 mx-1" />
                  
                  <button onClick={handleCopySelected} className="w-7 h-7 hover:bg-gray-100 rounded flex items-center justify-center" title="Duplicate">
                    <Plus size={14} />
                  </button>
                  <button onClick={handleToggleLockSelected} className={`w-7 h-7 rounded flex items-center justify-center ${selectedItem.isLocked ? 'bg-rose-50 text-rose-500' : 'hover:bg-gray-100'}`} title="Lock">
                    {selectedItem.isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>
                  <button onClick={() => setItems(prev => prev.filter(i => i.id !== selectedItem.id))} className="w-7 h-7 hover:bg-red-50 text-red-500 rounded flex items-center justify-center" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Canvas Container */}
            <div
              className="flex-1 flex items-center justify-center p-8 overflow-hidden cursor-grab active:cursor-grabbing"
              ref={containerRef}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleStageDrop}
            >
              <div className="relative shadow-2xl transition-transform duration-300" style={{ transform: `scale(${stageScale})` }}>
                <Stage
                  ref={stageRef}
                  width={stageSize.width}
                  height={stageSize.height}
                  onMouseDown={handleStageMouseDown}
                  onTouchStart={handleStageMouseDown}
                  onMouseMove={handleStageMouseMove}
                  onMouseUp={handleStageMouseUp}
                  onTouchMove={handleStageMouseMove}
                  onTouchEnd={handleStageMouseUp}
                  x={stagePosition.x}
                  y={stagePosition.y}
                  draggable={isPanning}
                  onDragEnd={handleStageDragEnd}
                  onWheel={handleWheel}
                  className="bg-white dark:bg-[#1A1A1A]"
                >
                  {showBleedLines && (
                    <Layer listening={false}>
                      <Rect
                        x={24}
                        y={24}
                        width={stageSize.width - 48}
                        height={stageSize.height - 48}
                        stroke="#FF0000"
                        strokeWidth={0.5}
                        dash={[4, 4]}
                        opacity={0.3}
                      />
                      <Rect
                        x={48}
                        y={48}
                        width={stageSize.width - 96}
                        height={stageSize.height - 96}
                        stroke="#0000FF"
                        strokeWidth={0.5}
                        dash={[4, 4]}
                        opacity={0.3}
                      />
                    </Layer>
                  )}
                  <Layer>
                    {items
                      .filter((item) => (item.page || 1) === currentPage)
                      .map((item) => {
                        if (item.type === 'text') {
                          return (
                            <CanvasText
                              key={item.id}
                              item={item}
                              isSelected={selectedIds.includes(item.id)}
                              onSelect={handleSelectItem}
                              onDragStart={handleItemDragStart}
                              onDragMove={handleItemDragMove}
                              onDragEnd={handleTextDragEnd}
                              onEdit={handleTextEdit}
                              onTransformEnd={handleTextTransformEnd}
                              onChange={handleTextStyleChange}
                            />
                          );
                        }
                        if (item.type === 'curvedText') {
                          return (
                            <CanvasCurvedText
                              key={item.id}
                              item={item}
                              isSelected={selectedIds.includes(item.id)}
                              onSelect={handleSelectItem}
                              onDragStart={handleItemDragStart}
                              onDragMove={handleItemDragMove}
                              onDragEnd={handleTextDragEnd}
                              onEdit={handleTextEdit}
                              onTransformEnd={handleTextTransformEnd}
                            />
                          );
                        }
                        if (item.type === 'image') {
                          return (
                            <CanvasImage
                              key={item.id}
                              item={item}
                              isSelected={selectedIds.includes(item.id)}
                              onSelect={handleSelectItem}
                              onDragStart={handleItemDragStart}
                              onDragMove={handleItemDragMove}
                              onDragEnd={handleImageDragEnd}
                              onTransformEnd={handleImageTransformEnd}
                              onDoubleClick={handleImageDoubleClick}
                              isCropping={isCropping && cropTarget === item.id}
                              onCropChange={handleCropSave}
                            />
                          );
                        }
                        if (item.type === 'pen') {
                          return (
                            <CanvasPen
                              key={item.id}
                              item={item}
                              isSelected={selectedIds.includes(item.id)}
                              onSelect={handleSelectItem}
                              onDragStart={handleItemDragStart}
                              onDragMove={handleItemDragMove}
                              onDragEnd={handleTextDragEnd}
                              onTransformEnd={handleImageTransformEnd}
                            />
                          );
                        }
                        return null;
                      })}
                    {guides.map((guide, index) => (
                      <Line
                        key={index}
                        points={
                          guide.orientation === 'vertical'
                            ? [guide.position, 0, guide.position, stageSize.height]
                            : [0, guide.position, stageSize.width, guide.position]
                        }
                        stroke="#6366F1"
                        strokeWidth={1}
                        dash={[4, 4]}
                      />
                    ))}
                    {comments
                      .filter(c => (c.page || 1) === currentPage)
                      .map(c => (
                        <KonvaGroup key={c.id} x={c.x} y={c.y}>
                          <Rect
                            width={24}
                            height={24}
                            fill="#F43F5E"
                            cornerRadius={12}
                            shadowBlur={5}
                            onClick={() => alert(`Comment: ${c.text}`)}
                          />
                          <KonvaText 
                            text="💬" 
                            fontSize={14} 
                            fill="white" 
                            x={4} 
                            y={4} 
                          />
                        </KonvaGroup>
                      ))}
                  </Layer>
                </Stage>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="h-12 bg-white dark:bg-[#1A1A1A] border-t border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 z-20">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-[10px] font-bold px-2">Page {currentPage} of {totalPages}</span>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded disabled:opacity-30"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <button
                  onClick={handleDuplicatePage}
                  className="text-[10px] font-bold px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  + Add Page
                </button>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTool(activeTool === 'pen' ? 'select' : 'pen')}
                  className={`p-1.5 rounded-lg transition ${
                    activeTool === 'pen' ? 'bg-rose-50 text-rose-500 shadow-inner' : 'hover:bg-gray-100'
                  }`}
                  title="Pen Tool"
                >
                  <span className="text-[10px] font-bold">Pen</span>
                </button>
                <button
                  onClick={() => setIsPanning(!isPanning)}
                  className={`p-1.5 rounded-lg transition ${
                    isPanning ? 'bg-rose-50 text-rose-500 shadow-inner' : 'hover:bg-gray-100'
                  }`}
                  title="Pan Tool (Hold Space)"
                >
                  <Grab size={18} />
                </button>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button onClick={() => handleZoom('out')} className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded">
                    <Minus size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setStageScale(1);
                      setStagePosition({ x: 0, y: 0 });
                    }}
                    className="text-[10px] font-black min-w-[36px] text-center hover:text-rose-500 transition"
                    title="Reset Zoom"
                  >
                    {Math.round(stageScale * 100)}%
                  </button>
                  <button onClick={() => handleZoom('in')} className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Customizations;
