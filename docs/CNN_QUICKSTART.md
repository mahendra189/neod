# Quick Start: CNN MNIST Workflow

## 🚀 Get Started in 3 Minutes

### Step 1: Create the Workflow (1 min)

Drag these nodes from the sidebar onto the canvas:

1. **MNIST Dataset** (from Dataset category)
2. **Data Preprocessing** (from Config & Training)
3. **CNN Algorithm** (from Algorithms)
4. **Neural Layer** (from Core Layers) 
5. **Adam Optimizer** (from Optimizers)
6. **CrossEntropy Loss** (from Loss Functions)
7. **Training Config** (from Config & Training)
8. **Training Visualizer** (from Testing & Inference)
9. **Digit Drawer** (from Testing & Inference)
10. **CNN Output** (from Input/Output)

### Step 2: Connect the Nodes (30 seconds)

Connect in this order:
```
MNIST Dataset → Data Preprocessing → CNN Algorithm → Neural Layer
                                                         ↓
                                                    CNN Output
                                                         ↑
                                                  Digit Drawer

Training Visualizer (standalone - will auto-update during training)
```

Optimizers, Loss, and Training Config can be connected to any node or left standalone.

### Step 3: Train the Model (2 minutes)

1. Click **"Train Model"** button at the top
2. Watch the **Training Visualizer** update in real-time
3. Loss and accuracy graphs will show progress
4. Wait for "Training Complete!" message

### Step 4: Test Inference (30 seconds)

1. Double-click the **Digit Drawer** node
2. Draw a digit (0-9) with your mouse
3. Click **"Run Inference"**
4. See prediction in:
   - Digit Drawer preview
   - CNN Output node with confidence bars

## 🎯 Expected Results

- **Training Time**: ~2-3 minutes
- **Final Accuracy**: 95-98%
- **Inference Speed**: <50ms per digit

## 💡 Tips

- Use default parameters for best results
- Draw digits clearly in the center
- Clear and redraw to test different digits
- Watch confidence bars update in CNN Output

## 🔧 Customization Options

### Adjust Training:
- **Training Config Node**: Change epochs (default: 10)
- **Optimizer Node**: Adjust learning rate (default: 0.001)
- **CNN Algorithm Node**: Modify architecture (filters, layers)

### Experiment:
- Try different optimizers (SGD, RMSprop)
- Add more conv layers
- Adjust dropout rate
- Use learning rate schedulers

## 📊 What to Watch

During training:
- **Loss should decrease** (starting ~2.3, ending ~0.1)
- **Accuracy should increase** (starting ~10%, ending ~95%+)
- **Graphs should be smooth** (not erratic)
- **Progress bar advances** each epoch

## ⚠️ Troubleshooting

**Training not starting?**
- Make sure MNIST Dataset node shows "Dataset Ready"
- Check CNN Algorithm node is in the workflow
- Click "Train Model" button (top toolbar)

**Inference not working?**
- Train the model first
- Make sure Digit Drawer is connected to CNN Output
- Draw clearly in the center of the canvas

**Low accuracy?**
- Increase epochs to 20-30
- Check data is loaded (MNIST Dataset should show 60,000 samples)
- Verify loss is decreasing

## 🎨 Visual Guide

```
┌─────────────────┐
│ MNIST Dataset   │ ← Click "Load MNIST Data"
│ Train: 60,000   │
│ Test:  10,000   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ CNN Algorithm   │ ← Model architecture
│ 2 Conv Layers   │
│ Filters: 32, 64 │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Neural Layer    │ ← Dense layers
│ Output: 10      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  CNN Output     │ ← Shows predictions
│  0 ████ 95%     │   with confidence bars
│  1 ▌ 2%         │
│  2 ▌ 1%         │
└─────────────────┘
```

## 🎉 Success Indicators

✅ MNIST Dataset shows "Dataset Ready"
✅ Training Visualizer shows live graphs
✅ Loss curve trending downward
✅ Accuracy curve trending upward
✅ Digit Drawer predicts correctly
✅ CNN Output shows high confidence (>90%)

## 📝 Example Workflow JSON

Your current workflow already has all the components! Just click "Train Model" to start.

## 🚦 Next Steps

After your first successful training:

1. **Test various digits** - Try all numbers 0-9
2. **Experiment with architecture** - Add/remove layers
3. **Tune hyperparameters** - Try different learning rates
4. **Compare optimizers** - Test Adam vs SGD vs RMSprop
5. **Train longer** - Increase epochs for better accuracy

## 📚 Learn More

- Full documentation: `docs/CNN_MNIST_IMPLEMENTATION.md`
- Troubleshooting: `docs/TROUBLESHOOTING.md`
- API reference: Check component source files

---

**Ready to train?** Click "Train Model" and watch the magic happen! ✨
