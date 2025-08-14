import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Upload, Grid, List, FolderPlus, Star, Archive, Tag, Download, Trash2, Copy, Move, Filter, SortAsc, Eye, FileText, Image, Code, Folder, File, ChevronRight, ChevronDown, Loader, Sparkles, Brain, Link, Calendar, BarChart3, Settings } from 'lucide-react';

// Simulated file data with rich metadata
const generateMockFiles = () => {
  const fileTypes = ['pdf', 'jpg', 'png', 'js', 'py', 'txt', 'docx', 'mp4', 'mp3', 'zip'];
  const topics = ['work', 'personal', 'projects', 'photos', 'documents', 'media', 'archive'];
  const files = [];

  for (let i = 0; i < 2500; i++) {
    const type = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const name = `${topic}_file_${i}.${type}`;
    const size = Math.floor(Math.random() * 10000000) + 1000;
    const modified = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    
    files.push({
      id: i,
      name,
      type,
      size,
      modified,
      path: `/${topic}/${name}`,
      tags: [topic, type, Math.random() > 0.7 ? 'important' : null].filter(Boolean),
      content: type === 'txt' ? `Sample content for ${name}` : null,
      thumbnail: type.includes('jpg') || type.includes('png') ? `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="hsl(${Math.random() * 360}, 70%, 80%)"/></svg>`)}` : null,
      duplicates: Math.random() > 0.9 ? [i + 1000, i + 2000] : [],
      aiSuggestions: {
        category: topic,
        confidence: Math.random(),
        suggestedPath: `/${topic}/organized/${name}`,
        relatedFiles: [],
        complexity: type === 'js' || type === 'py' ? Math.floor(Math.random() * 10) + 1 : null
      },
      accessed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      starred: Math.random() > 0.8,
      archived: Math.random() > 0.95
    });
  }

  return files;
};

const FileIcon = ({ type, className = "w-4 h-4" }) => {
  const iconMap = {
    pdf: <FileText className={`${className} text-red-500`} />,
    jpg: <Image className={`${className} text-blue-500`} />,
    png: <Image className={`${className} text-blue-500`} />,
    js: <Code className={`${className} text-yellow-500`} />,
    py: <Code className={`${className} text-green-500`} />,
    txt: <FileText className={`${className} text-gray-500`} />,
    docx: <FileText className={`${className} text-blue-600`} />,
    mp4: <File className={`${className} text-purple-500`} />,
    mp3: <File className={`${className} text-pink-500`} />,
    zip: <Archive className={`${className} text-orange-500`} />
  };
  
  return iconMap[type] || <File className={`${className} text-gray-400`} />;
};

const FileCard = ({ file, isSelected, onSelect, onDoubleClick, viewMode }) => {
  const formatSize = (bytes) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (viewMode === 'list') {
    return (
      <div 
        className={`flex items-center p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${isSelected ? 'bg-blue-50 border-blue-200' : ''}`}
        onClick={() => onSelect(file.id)}
        onDoubleClick={() => onDoubleClick(file)}
      >
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={() => onSelect(file.id)}
          className="mr-3"
        />
        <FileIcon type={file.type} className="w-5 h-5 mr-3" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <span className="font-medium text-gray-900 truncate">{file.name}</span>
            {file.starred && <Star className="w-4 h-4 text-yellow-500 ml-2" />}
            {file.duplicates.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                {file.duplicates.length} duplicates
              </span>
            )}
          </div>
          <div className="flex items-center mt-1 space-x-2">
            {file.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="text-sm text-gray-500 w-20">{formatSize(file.size)}</div>
        <div className="text-sm text-gray-500 w-24">{formatDate(file.modified)}</div>
        <div className="w-24">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${file.aiSuggestions.confidence > 0.8 ? 'bg-green-500' : file.aiSuggestions.confidence > 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500">{Math.round(file.aiSuggestions.confidence * 100)}%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative p-4 border rounded-lg hover:shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
      onClick={() => onSelect(file.id)}
      onDoubleClick={() => onDoubleClick(file)}
    >
      <div className="absolute top-2 right-2">
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={() => onSelect(file.id)}
          className="rounded"
        />
      </div>
      
      {file.starred && (
        <Star className="absolute top-2 left-2 w-4 h-4 text-yellow-500" />
      )}

      <div className="flex flex-col items-center space-y-3">
        {file.thumbnail ? (
          <div className="w-16 h-16 rounded-lg overflow-hidden">
            <img src={file.thumbnail} alt={file.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg">
            <FileIcon type={file.type} className="w-8 h-8" />
          </div>
        )}
        
        <div className="text-center w-full">
          <div className="font-medium text-gray-900 text-sm truncate">{file.name}</div>
          <div className="text-xs text-gray-500 mt-1">{formatSize(file.size)}</div>
        </div>

        {file.duplicates.length > 0 && (
          <div className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
            {file.duplicates.length} duplicates
          </div>
        )}

        <div className="flex flex-wrap gap-1 justify-center">
          {file.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-1 ${file.aiSuggestions.confidence > 0.8 ? 'bg-green-500' : file.aiSuggestions.confidence > 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-500">AI: {Math.round(file.aiSuggestions.confidence * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

const VirtualizedFileList = ({ files, selectedFiles, onSelectFile, onDoubleClick, viewMode }) => {
  const containerRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const itemHeight = viewMode === 'list' ? 80 : 200;
  const itemsPerRow = viewMode === 'grid' ? 6 : 1;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const totalRows = Math.ceil(files.length / itemsPerRow);
      
      const start = Math.floor(scrollTop / itemHeight);
      const end = Math.min(start + Math.ceil(containerHeight / itemHeight) + 5, totalRows);
      
      setVisibleRange({ start: Math.max(0, start - 5), end });
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => container.removeEventListener('scroll', handleScroll);
  }, [files.length, itemHeight, itemsPerRow]);

  const visibleFiles = useMemo(() => {
    const result = [];
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      const startIndex = i * itemsPerRow;
      const endIndex = Math.min(startIndex + itemsPerRow, files.length);
      for (let j = startIndex; j < endIndex; j++) {
        if (files[j]) result.push(files[j]);
      }
    }
    return result;
  }, [files, visibleRange, itemsPerRow]);

  const totalHeight = Math.ceil(files.length / itemsPerRow) * itemHeight;

  return (
    <div ref={containerRef} className="flex-1 overflow-auto">
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div 
          style={{ 
            transform: `translateY(${visibleRange.start * itemHeight}px)`,
            position: 'absolute',
            width: '100%'
          }}
        >
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-6 gap-4 p-4">
              {visibleFiles.map(file => (
                <FileCard
                  key={file.id}
                  file={file}
                  isSelected={selectedFiles.includes(file.id)}
                  onSelect={onSelectFile}
                  onDoubleClick={onDoubleClick}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {visibleFiles.map(file => (
                <FileCard
                  key={file.id}
                  file={file}
                  isSelected={selectedFiles.includes(file.id)}
                  onSelect={onSelectFile}
                  onDoubleClick={onDoubleClick}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AISuggestionPanel = ({ files, onApplySuggestion }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const generateSuggestions = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const newSuggestions = [
        {
          id: 1,
          type: 'organize',
          title: 'Organize by Project',
          description: 'Move 45 JavaScript files to /projects/web-app/',
          confidence: 0.92,
          fileCount: 45,
          action: 'move'
        },
        {
          id: 2,
          type: 'duplicate',
          title: 'Remove Duplicates',
          description: 'Found 23 duplicate images across multiple folders',
          confidence: 0.98,
          fileCount: 23,
          action: 'delete'
        },
        {
          id: 3,
          type: 'archive',
          title: 'Archive Old Files',
          description: 'Move 156 files not accessed in 6+ months to archive',
          confidence: 0.85,
          fileCount: 156,
          action: 'archive'
        },
        {
          id: 4,
          type: 'tag',
          title: 'Smart Tagging',
          description: 'Auto-tag 89 documents based on content analysis',
          confidence: 0.78,
          fileCount: 89,
          action: 'tag'
        }
      ];
      
      setSuggestions(newSuggestions);
      setIsAnalyzing(false);
    }, 2000);
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'organize': return <Folder className="w-5 h-5 text-blue-500" />;
      case 'duplicate': return <Copy className="w-5 h-5 text-orange-500" />;
      case 'archive': return <Archive className="w-5 h-5 text-gray-500" />;
      case 'tag': return <Tag className="w-5 h-5 text-green-500" />;
      default: return <Sparkles className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <div className="bg-white border-l border-gray-200 w-80 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-500" />
          AI Suggestions
        </h3>
        <button
          onClick={generateSuggestions}
          disabled={isAnalyzing}
          className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center text-sm"
        >
          {isAnalyzing ? <Loader className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {isAnalyzing && (
        <div className="flex flex-col items-center py-8">
          <Loader className="w-8 h-8 animate-spin text-purple-500 mb-4" />
          <p className="text-gray-600 text-center">Analyzing file patterns and relationships...</p>
        </div>
      )}

      <div className="space-y-3">
        {suggestions.map(suggestion => (
          <div key={suggestion.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center">
                {getSuggestionIcon(suggestion.type)}
                <span className="ml-2 font-medium text-gray-900">{suggestion.title}</span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-1 ${suggestion.confidence > 0.9 ? 'bg-green-500' : suggestion.confidence > 0.8 ? 'bg-yellow-500' : 'bg-orange-500'}`}></div>
                <span className="text-xs text-gray-500">{Math.round(suggestion.confidence * 100)}%</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{suggestion.fileCount} files</span>
              <button
                onClick={() => onApplySuggestion(suggestion)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        ))}
      </div>

      {suggestions.length === 0 && !isAnalyzing && (
        <div className="text-center py-8 text-gray-500">
          <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Click "Analyze" to get AI-powered file organization suggestions</p>
        </div>
      )}
    </div>
  );
};

const FileManager = () => {
  const [files] = useState(() => generateMockFiles());
  const [filteredFiles, setFilteredFiles] = useState(files);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [bulkOperation, setBulkOperation] = useState(null);

  // Filter and search logic
  useEffect(() => {
    let result = files;

    // Search filter
    if (searchQuery) {
      result = result.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (file.content && file.content.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Type filter
    if (filterBy !== 'all') {
      result = result.filter(file => {
        switch (filterBy) {
          case 'images': return ['jpg', 'png'].includes(file.type);
          case 'documents': return ['pdf', 'docx', 'txt'].includes(file.type);
          case 'code': return ['js', 'py'].includes(file.type);
          case 'media': return ['mp4', 'mp3'].includes(file.type);
          case 'duplicates': return file.duplicates.length > 0;
          case 'starred': return file.starred;
          case 'archived': return file.archived;
          default: return true;
        }
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'size': return b.size - a.size;
        case 'modified': return new Date(b.modified) - new Date(a.modified);
        case 'type': return a.type.localeCompare(b.type);
        case 'confidence': return b.aiSuggestions.confidence - a.aiSuggestions.confidence;
        default: return 0;
      }
    });

    setFilteredFiles(result);
  }, [files, searchQuery, filterBy, sortBy]);

  const handleSelectFile = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    setSelectedFiles(
      selectedFiles.length === filteredFiles.length 
        ? [] 
        : filteredFiles.map(file => file.id)
    );
  };

  const handleDoubleClick = (file) => {
    setSelectedFile(file);
  };

  const handleBulkOperation = (operation) => {
    setBulkOperation({ type: operation, files: selectedFiles });
    // Simulate operation
    setTimeout(() => {
      setBulkOperation(null);
      setSelectedFiles([]);
    }, 2000);
  };

  const handleApplySuggestion = (suggestion) => {
    setBulkOperation({ type: suggestion.action, description: suggestion.description });
    setTimeout(() => {
      setBulkOperation(null);
    }, 2000);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Folder className="w-8 h-8 mr-3 text-blue-600" />
              AI File Manager
            </h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search files, content, and metadata..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-96 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${showAIPanel ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              <Brain className="w-4 h-4 mr-2 inline" />
              AI Assistant
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Upload className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                onChange={handleSelectAll}
                className="rounded"
              />
              <span className="text-sm text-gray-600">
                {selectedFiles.length > 0 ? `${selectedFiles.length} selected` : `${filteredFiles.length} files`}
              </span>
            </div>

            {selectedFiles.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkOperation('move')}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  <Move className="w-4 h-4 mr-1 inline" />
                  Move
                </button>
                <button
                  onClick={() => handleBulkOperation('copy')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  <Copy className="w-4 h-4 mr-1 inline" />
                  Copy
                </button>
                <button
                  onClick={() => handleBulkOperation('delete')}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1 inline" />
                  Delete
                </button>
                <button
                  onClick={() => handleBulkOperation('archive')}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  <Archive className="w-4 h-4 mr-1 inline" />
                  Archive
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Files</option>
              <option value="images">Images</option>
              <option value="documents">Documents</option>
              <option value="code">Code</option>
              <option value="media">Media</option>
              <option value="duplicates">Duplicates</option>
              <option value="starred">Starred</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="name">Name</option>
              <option value="size">Size</option>
              <option value="modified">Modified</option>
              <option value="type">Type</option>
              <option value="confidence">AI Confidence</option>
            </select>

            <div className="flex items-center border border-gray-300 rounded">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Browser */}
        <div className="flex-1 flex flex-col">
          {viewMode === 'list' && (
            <div className="bg-gray-50 px-6 py-2 border-b border-gray-200">
              <div className="flex items-center text-sm font-medium text-gray-600">
                <div className="w-10"></div>
                <div className="w-8"></div>
                <div className="flex-1">Name</div>
                <div className="w-20">Size</div>
                <div className="w-24">Modified</div>
                <div className="w-24">AI Score</div>
              </div>
            </div>
          )}

          <VirtualizedFileList
            files={filteredFiles}
            selectedFiles={selectedFiles}
            onSelectFile={handleSelectFile}
            onDoubleClick={handleDoubleClick}
            viewMode={viewMode}
          />
        </div>

        {/* AI Suggestions Panel */}
        {showAIPanel && (
          <AISuggestionPanel
            files={files}
            onApplySuggestion={handleApplySuggestion}
          />
        )}
      </div>

      {/* Bulk Operation Progress */}
      {bulkOperation && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-center mb-2">
            <Loader className="w-5 h-5 animate-spin text-blue-500 mr-2" />
            <span className="font-medium">Processing {bulkOperation.type}...</span>
          </div>
          <p className="text-sm text-gray-600">{bulkOperation.description || `Performing ${bulkOperation.type} operation on ${bulkOperation.files?.length || 0} files`}</p>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">{selectedFile.name}</h3>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">File Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Size:</span> {(selectedFile.size / 1024).toFixed(1)} KB</div>
                    <div><span className="font-medium">Type:</span> {selectedFile.type}</div>
                    <div><span className="font-medium">Modified:</span> {selectedFile.modified.toLocaleDateString()}</div>
                    <div><span className="font-medium">Path:</span> {selectedFile.path}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">AI Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Category:</span> {selectedFile.aiSuggestions.category}</div>
                    <div><span className="font-medium">Confidence:</span> {Math.round(selectedFile.aiSuggestions.confidence * 100)}%</div>
                    <div><span className="font-medium">Suggested Path:</span> {selectedFile.aiSuggestions.suggestedPath}</div>
                    {selectedFile.aiSuggestions.complexity && (
                      <div><span className="font-medium">Complexity:</span> {selectedFile.aiSuggestions.complexity}/10</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFile.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {selectedFile.content && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Content Preview</h4>
                  <div className="bg-gray-50 p-4 rounded text-sm">
                    {selectedFile.content}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;
