let labels = [
  'Step 1: Define Your Theme',
  'Step 2: Research and Gather Inspiration',
  'Step 3: Outline Content and Structure',
  'Step 4: Collect Visual and Written Content',
  'Step 5: Choose a Layout and Design Tool',
  'Step 6: Create a Mockup',
  'Step 7: Finalize the Layout and Content',
  'Step 8: Proofread and Edit',
  'Step 9: Print or Digitize Your Zine',
  'Step 10: Distribute Your Zine'
];

let labels2 = Array(labels.length).fill(""); 
let rectangles = [];
let draggingRect = null;
let offsetX, offsetY;

let essayOutput, generateEssayBtn;
let buttonX = 100, buttonY = 460, buttonW = 200, buttonH = 50;

let colors = ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#eecbff', '#dbdcff'];
let lastClickTime = 0;
let doubleClickThreshold = 300;

let bgImg, typewriterImg, taskantImg, taskantGif;
let mainTheme = [];
let words = [];
let inputBox, inputBox2;
let sendButton, sendButton2;
let myFont;

// --- New variables for advice button/audio ---
let getAdviceBtn;
let adviceAudio;
let showGif = false;

function preload() {
  myFont = loadFont('Website/typewcond_bold.otf');
  bgImg = loadImage('Website/background.png');
  typewriterImg = loadImage('Website/typewriter.png');
  taskantImg = loadImage('Website/taskant.png');
  taskantGif = loadImage('Website/taskant.gif');
  adviceAudio = loadSound('Website/audio.mp3');
}

function setup() {
  createCanvas(1700, 3250);

  let indText = createP("What is your essay about?");
  indText.position(480, 260);
  indText.style('font-family', 'Courier Prime');
  indText.style('font-size', '16px');
  indText.style('color', 'black');
  indText.style('margin', '0');
  indText.style('white-space', 'nowrap');

  let indText2 = createP("How many words?:");
  indText2.position(1080, 260);
  indText2.style('font-family', 'Courier Prime');
  indText2.style('font-size', '16px');
  indText2.style('color', 'black');
  indText2.style('white-space', 'nowrap');
  indText2.style('margin', '0');

  inputBox = createInput();
  inputBox.position(450, 300);
  inputBox.size(450, 100);
  inputBox.style('height', '100px');
  inputBox.style('font-size', '16px');
  inputBox.style('border-radius', '12px');
  inputBox.style('background-color', 'rgba(212, 185, 94)');
  inputBox.input(updatePrompt);
  inputBox.style('font-family', 'Courier Prime');

  sendButton = createButton('Send');
  sendButton.position(inputBox.x + inputBox.width - 80, inputBox.y + 35);
  sendButton.style('font-family', 'Courier Prime');
  sendButton.style('font-size', '18px');
  sendButton.style('background-color', 'black');
  sendButton.style('color', 'white');
  sendButton.style('padding', '8px 16px');
  sendButton.style('border-radius', '8px');
  sendButton.mousePressed(logPrompt);

  inputBox2 = createInput();
  inputBox2.position(inputBox.x + 600, inputBox.y);
  inputBox2.size(220, 100);
  inputBox2.style('height', '100px');
  inputBox2.style('border-radius', '12px');
  inputBox2.style('background-color', 'rgba(212, 185, 94)');
  inputBox2.style('font-size', '16px');
  inputBox2.input(updateWords);
  inputBox2.style('font-family', 'Courier Prime');

  sendButton2 = createButton('Send');
  sendButton2.position(inputBox2.x + inputBox2.width - 80, inputBox2.y + 35);
  sendButton2.mousePressed(logWords);
  sendButton2.style('font-family', 'Courier Prime');
  sendButton2.style('font-size', '18px');
  sendButton2.style('background-color', 'black');
  sendButton2.style('color', 'white');
  sendButton2.style('padding', '8px 16px');
  sendButton2.style('border-radius', '8px');
  
  generateEssayBtn = createButton("Generate Essay");
  generateEssayBtn.position(1200, 550);
  generateEssayBtn.style('font-family', 'Courier Prime');
  generateEssayBtn.style('font-size', '18px');
  generateEssayBtn.style('background-color', '#006600');
  generateEssayBtn.style('color', 'white');
  generateEssayBtn.style('padding', '8px 16px');
  generateEssayBtn.style('border-radius', '8px');
  generateEssayBtn.style('width', '200px');  
  generateEssayBtn.style('height', '50px');
  generateEssayBtn.mousePressed(generateEssay);

  essayOutput = createElement('textarea');
  essayOutput.position(1000, 650);
  essayOutput.size(600, 1000);
  essayOutput.style('font-family', 'Courier Prime');
  essayOutput.style('font-size', '16px');
  essayOutput.style('background-color', 'rgb(245, 237, 214)');
  essayOutput.style('border-radius', '10px');
  essayOutput.style('padding', '25px');
  essayOutput.attribute('readonly', '');

  // --- New Get Advice button ---
  getAdviceBtn = createButton("Get Advice");
  getAdviceBtn.position(1390, 340); // right below taskantImg
  getAdviceBtn.style('font-family', 'Courier Prime');
  getAdviceBtn.style('font-size', '18px');
  getAdviceBtn.style('background-color', '#333');
  getAdviceBtn.style('color', 'white');
  getAdviceBtn.style('padding', '8px 16px');
  getAdviceBtn.style('border-radius', '8px');
  getAdviceBtn.size(200, 40);
  getAdviceBtn.mousePressed(playAdvice);

  for (let i = 0; i < labels.length; i++) {
    rectangles.push(new DraggableRect(50, 350 + i * 200 + 200, 250, 70, labels[i], labels2[i], i));
  }
}

function draw() {
  background(bgImg);
  textFont("Courier Prime");

  fill(0);
  textSize(120);
  textAlign(CENTER, TOP);
  text("ESSAY WRITER", width / 2, 60);
  textSize(24);
  image(typewriterImg, 200, 40, 250, 180);

  // Static taskant image
  image(taskantImg, 1335, 40, 315, 300);

  // Show gif only if playing audio
  if (showGif) {
    image(taskantGif, 1400, 62, 175, 255);
  }

  fill(157, 174, 17);
  rect(buttonX, buttonY, buttonW, buttonH, 5);
  fill(0);
  textAlign(CENTER, CENTER);
  text('Add Item', buttonX + buttonW / 2, buttonY + buttonH / 2);

  for (let rect of rectangles) {
    rect.update();
    rect.show();
  }

  reorderRectangles();
}

function playAdvice() {
  if (!adviceAudio.isPlaying()) {
    showGif = true;
    adviceAudio.play();
    adviceAudio.onended(() => {
      showGif = false;
    });
  }
}

function mousePressed() {
  let clickedOnRect = false;
  let currentTime = millis();

  for (let rect of rectangles) {
    if (rect.isMouseOver()) {
      if (currentTime - lastClickTime < doubleClickThreshold) {
        let newLabel = prompt("Edit the label:", rect.label);
        if (newLabel !== null && newLabel.trim() !== "") {
          rect.label = newLabel.trim();
          labels[rect.index] = rect.label;
        }
      } else {
        draggingRect = rect;
        offsetX = mouseX - rect.x;
        offsetY = mouseY - rect.y;
      }
      clickedOnRect = true;
      lastClickTime = currentTime;
      break;
    }
  }

  if (!clickedOnRect && isButtonClicked()) {
    let newLabel = prompt("Enter the label for the new item:");
    if (newLabel && newLabel.trim() !== "") {
      let newRect = new DraggableRect(50, 350 + rectangles.length * 200 + 200, 250, 70, newLabel.trim(), "", labels.length);
      rectangles.push(newRect);
      labels.push(newLabel.trim());
      labels2.push("");
    } else {
      alert("Invalid label. Item was not added.");
    }
  }
}

function mouseReleased() {
  draggingRect = null;
  reorderRectangles();
}

function isButtonClicked() {
  return mouseX > buttonX && mouseX < buttonX + buttonW &&
         mouseY > buttonY && mouseY < buttonY + buttonH;
}

function reorderRectangles() {
  if (draggingRect) return;
  rectangles.sort((a, b) => a.y - b.y);
  for (let i = 0; i < rectangles.length; i++) {
    rectangles[i].y = 350 + i * 200 + 200;
    labels[i] = rectangles[i].label;
    labels2[i] = rectangles[i].label2;
    rectangles[i].index = i;
  }
}

class DraggableRect {
  constructor(x, y, w, h, label, label2, index) {
    this.x = x;
    this.y = y;
    this.w = w * 1.25;
    this.h = 70;
    this.label = label;
    this.label2 = label2;
    this.color = random(colors);
    this.index = index;

    this.input1 = createInput(this.label);
    this.input1.position(this.x, this.y);
    this.input1.size(300, this.h);
    this.input1.style('font-family', 'Courier Prime');
    this.input1.style('background-color', 'rgb(245, 237, 214)');
    this.input1.style('border-radius', '10px');
    this.input1.input(() => {
      this.label = this.input1.value();
      labels[this.index] = this.label;
    });

    this.input2 = createInput("");
    this.input2.position(this.x + 400, this.y);
    this.input2.size(450, this.h + 100);
    this.input2.style('font-family', 'Courier Prime');
    this.input2.style('background-color', 'rgb(245, 237, 214)');
    this.input2.style('border-radius', '10px');
    this.input2.input(() => {
      this.label2 = this.input2.value();
      labels2[this.index] = this.label2;
    });

    this.deleteBtn = createButton("Delete");
    this.deleteBtn.style('font-family', 'Courier Prime');
    this.deleteBtn.style('font-size', '14px');
    this.deleteBtn.style('background-color', '#cc0000');
    this.deleteBtn.style('color', 'white');
    this.deleteBtn.style('padding', '4px 10px');
    this.deleteBtn.style('border-radius', '8px');
    this.deleteBtn.mousePressed(() => {
      rectangles.splice(this.index, 1);
      labels.splice(this.index, 1);
      labels2.splice(this.index, 1);

      rectangles.forEach((r, i) => r.index = i);

      this.input1.remove();
      this.input2.remove();
      this.deleteBtn.remove();
      this.generateBtn.remove();
    });

    this.generateBtn = createButton("Generate");
    this.generateBtn.style('font-family', 'Courier Prime');
    this.generateBtn.style('font-size', '14px');
    this.generateBtn.style('background-color', '#0066cc');
    this.generateBtn.style('color', 'white');
    this.generateBtn.style('padding', '4px 10px');
    this.generateBtn.style('border-radius', '8px');
    this.generateBtn.mousePressed(() => {
      labels2[this.index] = this.input1.value(); 
      this.input2.value(labels2[this.index]);
      this.label2 = labels2[this.index];
    });
  }

  update() {
    if (draggingRect === this) {
      this.y = mouseY - offsetY;
    }
    this.input1.position(this.x, this.y);
    this.input2.position(this.x + 400, this.y);
    this.deleteBtn.position(this.x + 150, this.y + 80);
    this.generateBtn.position(this.x + 250, this.y + 80);
  }

  show() {
    this.input1.show();
    this.input2.show();
    this.deleteBtn.show();
    this.generateBtn.show();
  }

  isMouseOver() {
    return mouseX > this.x && mouseX < this.x + this.w &&
           mouseY > this.y && mouseY < this.y + this.h;
  }
}

function updatePrompt() {
  mainTheme[0] = this.value();
}

function updateWords() {
  words[0] = this.value();
}

function logPrompt() {
  console.log(mainTheme);
}

function logWords() {
  console.log(words);
}

function generateEssay() {
  let paragraphs = labels2
    .map(text => text.trim())
    .filter(text => text.length > 0)
    .join("\n\n");
  essayOutput.value(paragraphs);
}
