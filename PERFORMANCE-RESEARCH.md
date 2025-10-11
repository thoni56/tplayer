# Startup Performance Research

## Problem Statement
Application startup was taking 10+ seconds due to cover image processing during cache loading.

## Research Conducted (Branch: `optimize-startup-covers`)

### Initial Hypothesis
Assumed the bottleneck was processing/converting base64 cover data after reading from cache.

### Test Environment
- **Development**: 3,651 tunes, ~74MB cache, 22.5% with covers
- **Production**: 4,555 tunes, ~74MB cache, 78.6% with covers (3,579 actual covers)

## Key Discoveries

### 1. Cover Data Volume
- **Production cache contains 735MB** of base64 cover data
- **Individual covers**: 13K-184K characters each
- **Average cover size**: ~200KB base64 encoded

### 2. Performance Bottleneck Identification

#### Test 1: Extract covers to Map + keep in TuneInfo
- **Result**: 11.367 seconds
- **Memory**: 735MB in Map + 735MB in TuneInfo objects

#### Test 2: Extract to Map + replace with defaults
- **Result**: 10.767 seconds  
- **Memory**: 735MB in Map only

#### Test 3: Skip ALL base64 processing
- **Result**: 10.728 seconds
- **Memory**: ~0MB base64 processing

### 3. Root Cause
**JSON parsing with embedded 735MB base64 data is the fundamental bottleneck.**

Even when we:
- ✅ Skip all string processing
- ✅ Skip all Map operations  
- ✅ Skip all base64 manipulation
- ✅ Just replace with defaults

**Performance remains identical (~10.7 seconds)**

## Architecture Implications

### The Real Problem
Stream-JSON parser must still:
- Read through 735MB of base64 characters
- Parse them as JSON strings 
- Allocate temporary memory
- Process large string objects

### Solution Required
**Separate cache architecture** rather than processing optimization:
```
~/.tplayer_metadata.cache    # Fast: Tune metadata only (~1-5MB)
~/.tplayer_covers.cache      # Heavy: Cover data (~735MB, lazy-loaded)
```

## Performance Targets
- **Current**: 10+ seconds startup
- **Target**: ~1 second startup (metadata only)
- **Covers**: Load on-demand/background

## Next Steps
1. Implement separate cache file architecture
2. Maintain legacy cache compatibility  
3. Add on-demand cover loading via IPC
4. Use Vue reactivity for progressive cover display

## Preserved Research
- Branch `optimize-startup-covers` contains full profiling infrastructure
- Detailed measurements and debugging tools available for future use
- Production vs development comparison data