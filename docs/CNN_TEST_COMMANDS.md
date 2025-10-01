# Quick Test Commands

## Start the App
```bash
cd /Users/mahendrakumar/Developer/neod
npm run dev
```

Then open: `http://localhost:3000/neuralnetwork`

---

## Testing the CNN Model (Step by Step)

### 1. Check Your Workflow
Your workflow already has these nodes:
- ✅ CNN Algorithm (`algorithmType: "cnn"`)
- ✅ Neural Layer
- ✅ Optimizer (Adam)
- ✅ Loss (CrossEntropy)
- ✅ Training Config
- ✅ Dataset
- ✅ Data Preprocessing
- ✅ Digit Drawer
- ✅ CNN Output (just added!)

### 2. Add These Nodes (from sidebar):
- **MNIST Dataset** (from "Dataset" category)
- **Training Visualizer** (from "Testing & Inference" category)

### 3. Run Training
1. Click "Load MNIST Data" on MNIST Dataset node
2. Click **"Train Model"** button (top toolbar)
3. Watch console (F12) and Training Visualizer
4. Wait ~2-3 minutes

### 4. Test Inference
1. Double-click **Digit Drawer** node
2. Draw a digit (0-9)
3. Click **"Run Inference"**
4. See prediction in CNN Output node

---

## Quick Debug Commands

### Check if TensorFlow.js is loaded:
```javascript
// Open browser console (F12) and run:
console.log(typeof tf !== 'undefined' ? 'TensorFlow.js loaded ✅' : 'Not loaded ❌')
```

### Check if CNN nodes are registered:
```javascript
// In console:
console.log('CNN Output node:', document.querySelector('[data-id*="cnnOutput"]') ? '✅' : '❌')
console.log('MNIST Dataset node:', document.querySelector('[data-id*="mnistDataset"]') ? '✅' : '❌')
```

### Monitor training progress:
```javascript
// Console automatically shows:
// - Epoch progress
// - Loss values
// - Accuracy values
// Just keep console open (F12)
```

---

## Expected Console Output

### When Starting Training:
```
🚀 Starting CNN Training...
Building and training your CNN model...
📊 Loading MNIST dataset...
✅ Dataset loaded: 60,000 train / 10,000 test
🏗️  Building CNN model...
✅ Model built successfully
⚙️  Compiling model...
✅ Model compiled with Adam optimizer
```

### During Training:
```
🎓 Training:
Epoch 1/10 - loss: 2.301 - acc: 0.102
Epoch 2/10 - loss: 1.456 - acc: 0.523
Epoch 3/10 - loss: 0.912 - acc: 0.685
Epoch 4/10 - loss: 0.534 - acc: 0.821
Epoch 5/10 - loss: 0.342 - acc: 0.892
...
```

### After Training:
```
🧪 Evaluating model on test data...
✅ Test Loss: 0.092 - Test Accuracy: 0.974
💾 Saving model...
✅ Model saved to localstorage://mnist-cnn-model
🎉 Training Complete! Your CNN model is trained and ready for inference.
```

### During Inference:
```
CNN Inference called with image data
Predicted: 7 (confidence: 0.892)
CNN Output node updated with predictions
```

---

## Keyboard Shortcuts

- **F12** - Open browser console (see logs)
- **Ctrl/Cmd + Shift + C** - Inspect element
- **Ctrl/Cmd + R** - Refresh page (if needed)
- **Esc** - Close modal (Digit Drawer)

---

## Visual Checklist

### Before Training:
```
[ ] Dev server running (npm run dev)
[ ] Browser open at localhost:3000/neuralnetwork
[ ] Canvas shows your workflow
[ ] MNIST Dataset node visible
[ ] "Load MNIST Data" button present
[ ] Console open (F12)
```

### Load Dataset:
```
[ ] Click "Load MNIST Data"
[ ] Wait 1-2 seconds
[ ] See "Training Set: 60,000"
[ ] See "Test Set: 10,000"
[ ] See "✅ Dataset Ready"
```

### Train Model:
```
[ ] Click "Train Model" button
[ ] Console shows "Starting CNN Training..."
[ ] Training Visualizer updates
[ ] Loss curve appears
[ ] Accuracy curve appears
[ ] Progress bar moves
[ ] Wait for "Training Complete!"
```

### Test Inference:
```
[ ] Double-click Digit Drawer
[ ] Draw a digit clearly
[ ] Click "Run Inference"
[ ] See prediction appear
[ ] See CNN Output update
[ ] Confidence bars show
[ ] Predicted digit highlighted
```

---

## One-Line Test

The absolute fastest way to test (assuming workflow is loaded):

```
1. Click "Load MNIST Data" → wait 2 sec
2. Click "Train Model" → wait 2-3 min
3. Double-click Digit Drawer → draw "7" → click "Run Inference"
4. ✅ Done! Should predict "7" with high confidence
```

---

## Troubleshooting Commands

### If training doesn't start:
```bash
# Check console for errors
# Look for red text
# Common issues:
# - Dataset not loaded
# - CNN node missing
# - Network error
```

### If accuracy is low:
```javascript
// In Training Config node:
// - Increase epochs to 20
// - Keep batch size at 32
// - Keep learning rate at 0.001
// Retrain
```

### If inference fails:
```javascript
// Check if model is trained:
// Console should show "Training Complete!"
// If not, train first

// Check if Digit Drawer is connected:
// Should have line to CNN Output
```

### Clear everything and restart:
```bash
# Refresh browser (Ctrl+R)
# Or close and reopen tab
# Rebuilds everything fresh
```

---

## Performance Benchmarks

### Expected Timings:
- **Dataset Load**: 1-2 seconds
- **Model Build**: <1 second
- **Training (10 epochs)**: 2-3 minutes
- **Inference**: <50ms per image

### Expected Metrics:
- **Initial Loss**: ~2.3
- **Final Loss**: ~0.08-0.12
- **Initial Accuracy**: ~10%
- **Final Accuracy**: ~95-98%

### Memory Usage:
- **Initial**: ~100MB
- **During Training**: ~300-500MB
- **After Training**: ~150MB

---

## Quick Reference

| Action | Where | What to Click |
|--------|-------|---------------|
| Load Data | MNIST Dataset node | "Load MNIST Data" button |
| Train | Top toolbar | "Train Model" button |
| Draw | Digit Drawer node | Double-click node |
| Inference | Digit Drawer modal | "Run Inference" button |
| View Results | CNN Output node | (auto-updates) |
| View Metrics | Training Visualizer | (auto-updates) |
| Console | Browser | Press F12 |

---

## File Locations (for debugging)

If you need to check the code:

```
Components:
  components/nodes/NodeTypes/MNISTDatasetNode.tsx
  components/nodes/NodeTypes/CNNOutputNode.tsx
  components/nodes/NodeTypes/TrainingVisualizerNode.tsx
  components/FlowCanvas.tsx

Engine:
  runner/cnnTrainer.ts
  utils/cnnWorkflowExecutor.ts

Docs:
  docs/CNN_TESTING_GUIDE.md (this file)
  docs/CNN_QUICKSTART.md
  docs/CNN_MNIST_IMPLEMENTATION.md
```

---

## Success Criteria

✅ **Training Success:**
- Loss decreases from ~2.3 to ~0.1
- Accuracy increases from ~10% to ~95%+
- Training completes without errors
- Takes 2-3 minutes

✅ **Inference Success:**
- Predictions are instant (<50ms)
- Predicted digit matches drawn digit
- Confidence is high (>80%)
- CNN Output shows bars correctly

✅ **System Success:**
- No red errors in console
- All nodes update correctly
- Can retrain multiple times
- Can test multiple digits

---

**Ready to test? Start with:**

```bash
npm run dev
# Open http://localhost:3000/neuralnetwork
# Load data → Train → Test
```

**That's it!** 🚀
