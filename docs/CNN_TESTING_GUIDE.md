# Testing the CNN Model - Step by Step Guide

## Prerequisites ✅

Before testing, ensure:
1. Development server is running: `npm run dev`
2. Browser is open at `http://localhost:3000`
3. Navigate to the Neural Network page (click "Neural Network" in navbar)

## Testing Steps

### Option 1: Use Your Existing Workflow (Quickest!)

You already have a CNN workflow with all the necessary nodes! Here's how to test it:

#### Step 1: Load Your Workflow (Already Done!)
Your workflow JSON already contains:
- ✅ CNN Algorithm node
- ✅ Neural Layer
- ✅ Optimizer (Adam)
- ✅ Loss (CrossEntropy)
- ✅ Scheduler (ReduceLROnPlateau)
- ✅ Training Config
- ✅ Dataset node
- ✅ Data Preprocessing
- ✅ Digit Drawer
- ✅ CNN Output

#### Step 2: Add Missing Nodes (Optional but Recommended)

To see the full experience, add these two nodes:

**A. MNIST Dataset Node:**
1. Look at the sidebar on the left
2. Find "Dataset" category
3. Drag **"MNIST Dataset"** onto the canvas
4. Position it at the beginning of your workflow
5. Connect it to your Data Preprocessing node

**B. Training Visualizer Node:**
1. Find "Testing & Inference" category in sidebar
2. Drag **"Training Visualizer"** onto the canvas
3. Place it near your workflow (doesn't need connections - updates automatically)

#### Step 3: Load the Dataset

1. Find the **MNIST Dataset** node on canvas
2. Click the **"Load MNIST Data"** button
3. Wait ~1-2 seconds
4. You should see:
   - Training Set: 60,000
   - Test Set: 10,000
   - ✅ Dataset Ready

#### Step 4: Train the Model 🚀

1. Look at the **top toolbar** of the canvas
2. Find the **"Train Model"** button (or "Run" button)
3. Click it!

**What happens next:**
```
🔍 System detects CNN workflow automatically
🏗️  Builds CNN model from your nodes
📊 Starts training...
```

#### Step 5: Watch Training Progress 📈

While training, you'll see:

**In Console (press F12 to open Developer Tools):**
```
Starting CNN Training...
Loading MNIST dataset...
✅ Dataset loaded: 60,000 train / 10,000 test
Building CNN model...
✅ Model built successfully
Compiling model...
✅ Model compiled
Training model...

Epoch 1/10 - loss: 2.301 - accuracy: 0.102
Epoch 2/10 - loss: 1.456 - accuracy: 0.523
Epoch 3/10 - loss: 0.912 - accuracy: 0.685
...
```

**On Canvas:**
- Training Visualizer node updates with live graphs
- Progress bar advances
- Loss curve appears and updates
- Accuracy curve appears and updates
- Current epoch counter increases

**Wait for completion** (~2-3 minutes for 10 epochs)

#### Step 6: Success Message 🎉

When training completes, you'll see:
```
✅ Training Complete!
Your CNN model is trained and ready for inference.
Try the Digit Drawer!
```

#### Step 7: Test Predictions 🎨

Now the fun part - testing your trained model!

**Method 1: Use Digit Drawer Node**
1. **Double-click** the Digit Drawer node
2. A canvas modal opens
3. **Draw a digit** (0-9) with your mouse
4. Click **"Run Inference"** button
5. See the prediction appear:
   - In the Digit Drawer preview box
   - In the CNN Output node with confidence bars

**Method 2: Direct Canvas Drawing**
1. Find the Digit Drawer node
2. It should show a small preview
3. Click it to open full canvas
4. Draw and test

#### Step 8: Check CNN Output Node 🎯

After inference, look at the **CNN Output** node on canvas:

You'll see:
```
Predicted: 7

Confidence Scores:
0  ▌ 2%
1  ▌ 1%
2  ▌ 0%
3  ▌ 3%
4  ▌ 1%
5  ▌ 2%
6  ▌ 1%
7  ████████████████████ 89%  ← Your prediction
8  ▌ 1%
9  ▌ 0%

Predicted: 7 (89.2% confidence)
```

### Option 2: Build From Scratch (Learning Experience)

If you want to build the workflow manually:

#### Step 1: Clear Canvas (Optional)
- Delete existing nodes or start fresh

#### Step 2: Add Nodes in Order

Drag these from sidebar (in order):

1. **MNIST Dataset** (Dataset category)
2. **Data Preprocessing** (Config & Training)
3. **CNN Algorithm** (Algorithms)
4. **Neural Layer** (Core Layers)
5. **Adam Optimizer** (Optimizers)
6. **CrossEntropy Loss** (Loss Functions)
7. **Training Config** (Config & Training)
8. **Training Visualizer** (Testing & Inference)
9. **Digit Drawer** (Testing & Inference)
10. **CNN Output** (Input/Output)

#### Step 3: Connect Nodes

Create these connections (drag from right handle to left handle):

```
MNIST Dataset → Data Preprocessing → CNN Algorithm → Neural Layer
                                                          ↓
                                                      CNN Output
                                                          ↑
                                                    Digit Drawer
```

Optional connections:
- Optimizer → CNN Algorithm
- Loss → CNN Algorithm
- Training Config → CNN Algorithm

Training Visualizer is standalone (no connections needed)

#### Step 4-8: Follow same steps as Option 1

## Detailed Testing Checklist

### Before Training:
- [ ] MNIST Dataset node shows "Load MNIST Data" button
- [ ] All nodes are properly positioned
- [ ] Key nodes are connected
- [ ] Browser console is open (F12)

### During Training:
- [ ] Console shows "Starting CNN Training..."
- [ ] Dataset loads (shows 60,000 / 10,000)
- [ ] Model builds successfully
- [ ] Epochs start counting (1/10, 2/10, etc.)
- [ ] Loss decreases over time
- [ ] Accuracy increases over time
- [ ] Training Visualizer node updates live
- [ ] Graphs appear and update smoothly
- [ ] Progress bar advances

### After Training:
- [ ] Success message appears
- [ ] Training Visualizer shows final metrics
- [ ] Loss curve is complete (10 epochs)
- [ ] Accuracy curve is complete
- [ ] Final accuracy is 95%+ (good model)
- [ ] Console shows "Training Complete!"

### During Inference:
- [ ] Digit Drawer opens on double-click
- [ ] Can draw on canvas with mouse
- [ ] "Run Inference" button is clickable
- [ ] Prediction appears quickly (<50ms)
- [ ] CNN Output node updates with bars
- [ ] Predicted digit is highlighted in green
- [ ] Confidence percentages are shown
- [ ] Can clear and draw again

## Expected Results

### Training Metrics:
```
Initial:
- Loss: ~2.3 (high)
- Accuracy: ~10% (random guessing)

Mid-training (Epoch 5):
- Loss: ~0.3-0.5
- Accuracy: ~85-90%

Final (Epoch 10):
- Loss: ~0.08-0.12
- Accuracy: ~95-98%
```

### Inference Results:
```
Drawing: Clear digit "7"
Prediction: 7 (85-95% confidence)
Status: ✅ Correct!

Drawing: Messy digit
Prediction: Varies (50-70% confidence)
Status: ⚠️ Uncertain

Drawing: Ambiguous (could be 1 or 7)
Prediction: Top 2 classes both high
Status: ⚠️ Multiple possibilities
```

## Troubleshooting

### Issue: "Train Model" button not working
**Check:**
1. Is MNIST Dataset loaded? (should show "Dataset Ready")
2. Is CNN Algorithm node present?
3. Check browser console for errors
4. Try refreshing the page

**Fix:**
```
1. Click "Load MNIST Data" button first
2. Wait for dataset to load
3. Then click "Train Model"
```

### Issue: Training not starting
**Check:**
1. Browser console (F12) for errors
2. Network tab (are requests going through?)
3. Is TensorFlow.js loaded?

**Fix:**
```
1. Open console: Right-click → Inspect → Console
2. Look for errors in red
3. If "Cannot find module", refresh page
4. If memory error, close other tabs
```

### Issue: Training is very slow
**Reasons:**
- Computer is busy (close other apps)
- Browser is throttling (open in new window)
- Large batch size (default is 32, try 16)

**Fix:**
```
1. Close unnecessary browser tabs
2. Close other applications
3. In Training Config node, set batch size to 16
4. Reduce epochs to 5 for faster testing
```

### Issue: Low accuracy (<80%)
**Possible causes:**
- Not enough epochs (train longer)
- Learning rate too high/low
- Model architecture too simple

**Fix:**
```
1. Increase epochs to 20-30
2. Check optimizer learning rate (default 0.001 is good)
3. Verify loss is decreasing
4. If loss is NaN, reduce learning rate to 0.0001
```

### Issue: Inference not working
**Check:**
1. Did training complete successfully?
2. Is Digit Drawer connected to CNN Output?
3. Is there a trained model?

**Fix:**
```
1. Train model first (must complete successfully)
2. Check console for "Training Complete!" message
3. Then try drawing and inference
4. If still failing, retrain the model
```

### Issue: Prediction is always wrong
**Possible causes:**
- Model didn't train properly
- Drawing is unclear
- Wrong number of classes

**Fix:**
```
1. Check final training accuracy (should be >90%)
2. Draw digits clearly in center of canvas
3. Try drawing different digits
4. Retrain if accuracy was low
```

## Performance Tips

### For Faster Training:
1. **Reduce epochs**: Set to 5 instead of 10 (still gets ~90% accuracy)
2. **Smaller batch size**: Use 16 instead of 32
3. **Use Adam optimizer**: Already default (fastest convergence)
4. **Close other apps**: Free up CPU/memory

### For Better Accuracy:
1. **More epochs**: Use 20-30 instead of 10
2. **Lower learning rate**: Try 0.0001 instead of 0.001
3. **More training data**: (already using full MNIST)
4. **Deeper network**: Add more conv layers in CNN Algorithm node

### For Testing Inference:
1. **Draw clearly**: Use center of canvas
2. **Draw large**: Fill most of the canvas
3. **Draw simple**: Don't add extra strokes
4. **Try all digits**: Test 0-9 to see performance

## Success Indicators

### ✅ Good Training:
- Loss curve is smooth and decreasing
- Accuracy curve is smooth and increasing
- Final accuracy >95%
- Training completes without errors
- Takes 2-3 minutes

### ✅ Good Inference:
- Predictions are instant (<50ms)
- Confidence is high (>80%)
- Predictions match drawn digits
- CNN Output updates correctly
- Can test multiple times

### ✅ System Working Correctly:
- Console shows detailed logs
- Training Visualizer updates live
- Graphs are smooth
- No errors in console
- Can retrain multiple times

## Next Steps After Successful Test

1. **Experiment with parameters:**
   - Try different learning rates
   - Adjust number of epochs
   - Test different optimizers (SGD, RMSprop)

2. **Test model limits:**
   - Draw unclear digits
   - Draw very small/large digits
   - Draw rotated digits
   - See when model fails

3. **Compare architectures:**
   - Add more conv layers
   - Change filter sizes
   - Adjust dense layer sizes
   - Compare accuracy

4. **Build new workflows:**
   - Different dataset
   - Different architecture
   - Different task

## Recording Your Test

To document your test:

1. **Take screenshots** of:
   - Initial workflow
   - Training Visualizer during training
   - Final accuracy metrics
   - CNN Output with predictions
   - Digit Drawer with your drawings

2. **Record console output**:
   - Copy training logs
   - Save accuracy progression
   - Note any errors

3. **Test multiple digits**:
   - Draw 0-9
   - Record predictions
   - Note confidence scores

## Video Demo (If Recording)

1. **Intro** (10 sec):
   - Show the canvas with workflow

2. **Load Data** (10 sec):
   - Click "Load MNIST Data"
   - Show stats appear

3. **Train Model** (30 sec - speed up video):
   - Click "Train Model"
   - Show progress bar
   - Show graphs updating
   - Show final metrics

4. **Test Inference** (20 sec):
   - Open Digit Drawer
   - Draw a "7"
   - Show prediction
   - Show CNN Output

5. **Outro** (10 sec):
   - Show it works!

## Summary

To test the CNN model:

1. **Prepare**: Open Neural Network page
2. **Load**: Click "Load MNIST Data"
3. **Train**: Click "Train Model" (wait 2-3 min)
4. **Test**: Draw digits and see predictions
5. **Verify**: Check accuracy is >95%

**That's it!** You now have a working CNN model for MNIST digit classification! 🎉

---

**Need help?** Check the console for error messages or refer to `docs/CNN_MNIST_IMPLEMENTATION.md` for troubleshooting.

**Ready to test?** Start your dev server and follow the steps above! 🚀
