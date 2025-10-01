# 🚀 HOW TO TRAIN YOUR CNN MODEL - UPDATED

## ⚡ QUICK FIX - Use Console Command

Since you're getting "No trained model available", here's the **FASTEST** way to train:

### Step 1: Open Browser Console
Press **F12** (or Right-click → Inspect → Console tab)

### Step 2: Run This Command
Paste this into the console and press Enter:

```javascript
window.trainCNNModel()
```

### Step 3: Watch Training Happen! 🎉

You'll see:
```
🚀 Starting CNN Training from global function...
Starting CNN Training
Building and training your CNN model...
Loading MNIST dataset...
✅ Dataset loaded: 60,000 train / 10,000 test
🏗️  Building CNN model...
✅ Model built successfully
...
Training:
Epoch 1/10 - loss: 2.301 - acc: 0.102
Epoch 2/10 - loss: 1.456 - acc: 0.523
...
✅ Training Complete!
```

### Step 4: After Training Completes
Now you can use the Digit Drawer!
1. Double-click Digit Drawer node
2. Draw a digit
3. Click "Run Inference"
4. ✅ Should work!

---

## Alternative: Use "Run Model" Button

The "Run Model" button (▶️ icon) in the top-right toolbar will also work, but it might use the old training system. For CNN-specific training, use the console command above.

### Where is "Run Model" button?
Look at the **top-right corner** of the canvas:
- There's a toolbar with icons
- Find the **▶️ Play icon** button
- Click it to start training

---

## What Happened?

The error `"No trained model available"` means:
- You tried to run inference (Digit Drawer)
- But the model hasn't been trained yet
- You need to train first!

## Training Flow

```
1. Load Dataset (optional - auto-loaded during training)
   ↓
2. Train Model ← YOU ARE HERE
   ↓  
3. Wait 2-3 minutes
   ↓
4. See "Training Complete!"
   ↓
5. NOW you can use Digit Drawer ✅
```

---

## Detailed Steps

### Method 1: Console Command (Recommended)

```javascript
// Step 1: Open console (F12)
// Step 2: Paste and run:
window.trainCNNModel()

// Step 3: Wait and watch the logs
// Step 4: When done, test Digit Drawer
```

### Method 2: UI Button

1. Look for **FloatingToolbar** (top-right)
2. Find **▶️ icon** (Play/Run button)
3. Click it
4. Wait for training
5. Test inference

---

## Expected Console Output

### When Training Starts:
```
🚀 Starting CNN Training from global function...
Starting CNN Training
Building and training your CNN model...
📊 Loading MNIST dataset...
```

### During Training:
```
Epoch 1/10 ━━━━━━━━━━━━━━━━━━━━ loss: 2.301 - acc: 0.102
Epoch 2/10 ━━━━━━━━━━━━━━━━━━━━ loss: 1.456 - acc: 0.523  
Epoch 3/10 ━━━━━━━━━━━━━━━━━━━━ loss: 0.912 - acc: 0.685
Epoch 4/10 ━━━━━━━━━━━━━━━━━━━━ loss: 0.534 - acc: 0.821
Epoch 5/10 ━━━━━━━━━━━━━━━━━━━━ loss: 0.342 - acc: 0.892
...
```

### When Complete:
```
Epoch 10/10 ━━━━━━━━━━━━━━━━━━━ loss: 0.087 - acc: 0.978

🧪 Evaluating model on test data...
✅ Test Loss: 0.092 - Test Accuracy: 0.974

💾 Saving model...
✅ Model saved to localstorage://mnist-cnn-model

🎉 Training Complete!
Your CNN model is trained and ready for inference.
Try the Digit Drawer!
```

---

## After Training

### Test It Works:
1. **Check console** - Should say "Training Complete!"
2. **Double-click Digit Drawer** node
3. **Draw a digit** (like "7")
4. **Click "Run Inference"**
5. **See prediction** - Should predict your digit!

### What You'll See:
```
CNN Output Node will show:
- Predicted digit (highlighted in green)
- Confidence bars for all 10 digits
- Percentage scores
```

---

## Troubleshooting

### If `window.trainCNNModel()` says "undefined":
```javascript
// Try refreshing the page first
// Then run the command again
window.trainCNNModel()
```

### If training fails:
```javascript
// Check console for errors
// Look for red text
// Common issues:
// - Memory error → Close other tabs
// - Network error → Check internet
// - Module error → Refresh page
```

### If training is too slow:
```javascript
// Reduce epochs (quicker but less accurate)
// Default is 10, try 5:
// (This is done in the code, not via console)
// Just wait for the 10 epochs - should be 2-3 min
```

---

## Complete Checklist

Before training:
- [ ] Page is loaded (localhost:3000/neuralnetwork)
- [ ] Canvas shows your workflow
- [ ] Console is open (F12)

Start training:
- [ ] Run `window.trainCNNModel()` in console
- [ ] See "Starting CNN Training" message
- [ ] See epoch counting (1/10, 2/10, etc.)

During training (wait 2-3 min):
- [ ] Loss is decreasing
- [ ] Accuracy is increasing
- [ ] No error messages

After training:
- [ ] See "Training Complete!" message
- [ ] Final accuracy is 95%+
- [ ] Model is saved

Test inference:
- [ ] Double-click Digit Drawer
- [ ] Draw a digit clearly
- [ ] Click "Run Inference"
- [ ] See correct prediction ✅

---

## Visual Guide

### Your Screen Right Now:
```
┌──────────────────────────────┐
│  Browser Console (F12)       │
├──────────────────────────────┤
│ > window.trainCNNModel()     │ ← Type this
│                               │
│ 🚀 Starting CNN Training...  │ ← You'll see this
│ Epoch 1/10 ...                │
│ Epoch 2/10 ...                │
│ ...                           │
└──────────────────────────────┘
```

### After Training:
```
┌──────────────────────────────┐
│  Digit Drawer Node           │
├──────────────────────────────┤
│  [Draw your digit here]      │
│                               │
│  [Run Inference] ← Click     │
│                               │
│  Predicted: 7 (89%) ✅       │
└──────────────────────────────┘
```

---

## One-Line Solution

**Just run this in console:**
```javascript
window.trainCNNModel()
```

**Then wait 2-3 minutes and test with Digit Drawer!**

That's it! 🎉

---

## Need More Help?

If training still doesn't work:
1. Check console for errors (red text)
2. Try refreshing the page
3. Run the command again
4. Check network connection

If you see errors, share them and we can debug!

---

**TL;DR:**
1. Press F12
2. Type: `window.trainCNNModel()`
3. Wait 2-3 min
4. Use Digit Drawer
5. ✅ Done!
