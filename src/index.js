import * as Terminal from 'javascript-terminal';

/* global Terminal */

// Utilities
function addKeyDownListener(eventKey, target, onKeyDown) {
    target.addEventListener('keydown', e => {
        if (e.key === eventKey) {
            e.preventDefault();
            onKeyDown();
        }
    });
};

function scrollToPageEnd() {
    window.scrollTo(0, document.body.scrollHeight);
};

// User interface
const viewRefs = {
    input: document.querySelector('#input'),
    output: document.querySelector('#output-wrapper')
};

function createOutputDiv(className, textContent) {
    const div = document.createElement('div');
    
    div.className = className;
    textContent.split('\n').forEach(text => {
        div.appendChild(document.createTextNode(text));
        div.appendChild(document.createElement('br'));
    });
    
    return div;
};

const outputToHTMLNode = {
    [Terminal.OutputType.TEXT_OUTPUT_TYPE]: content =>
    createOutputDiv('text-output', content),
    [Terminal.OutputType.TEXT_ERROR_OUTPUT_TYPE]: content =>
    createOutputDiv('error-output', content),
    [Terminal.OutputType.HEADER_OUTPUT_TYPE]: content =>
    createOutputDiv('header-output', `$ ${content.command}`)
};

function displayOutputs(outputs) {
    console.log('called: ' + outputs);
    viewRefs.output.innerHTML = '';
    const outputNodes = outputs.map(output =>
        outputToHTMLNode[output.type](output.content)
        );

    for (const outputNode of outputNodes) {
        console.log(outputNode.textContent)
        viewRefs.output.appendChild(outputNode);
    }
    console.log(viewRefs.output.innerHTML);
    
};
    
const getInput = () => viewRefs.input.value;

const setInput = (input) => {
    viewRefs.input.value = input;
};

const clearInput = () => {
    setInput('');
};


const eventText = `Sysadmin appreciation day is celebrated on the last friday of July (this year, July 30th, 2021) - or the last Thursday of July in Israel.
Sysadmin day is pretty much the most important holiday of the year. It’s also the perfect opportunity to pay tribute to the heroic men and women who, come rain or shine, prevent disasters, keep IT secure and put out tech fires left and right. It is customary to bring your sysadmin gifts on this day and to avoid asking dumb question that you could easily find the answers to with a 2 minutes google search - actually you should avoid that on any day. And definitely don't ask for sudo privileges.

This year, we will celebrate Sysadmin day in Melio offices in Tel-Aviv, on Wednesday (date? time?).
Stay tuned!

https://sysadminday.com/

To register, use the \`register\` command (duh!)
`;

const eventHosts = `Niv Yungelson
Avishai Ish-Shalom (@nukemberg)`;

const customFileSystem = Terminal.FileSystem.create({
    '/README.txt': {content: eventText},
    '/etc': {},
    '/etc/hosts': {content: eventHosts},
    '/etc/hostname': {content: 'sudovisudo.wtf'}
});

const customCommandMapping = Terminal.CommandMapping.create({
    ...Terminal.defaultCommandMapping,
    'help': {
        'function': (state, opts) => {
            return {
                output: Terminal.OutputFactory.makeTextOutput(`Commands:
Filesystem commands - ls, cat
Other - register
---------
Hint: try \`ls \`
`)
            };
        },
        'optDef': {}
   },
   'register': {
       'function': (state, opts) => {
            window.location.href = 'https://docs.google.com/forms/d/e/1FAIpQLSdwP4e69N8I5_zrlcZICyY8vQ4ZJukM8Z9kjGluTd5Z9oyctg/viewform?usp=sf_link'
       },
       'optDef': {}
   } 
})
// Execution
const emulator = new Terminal.Emulator();

let emulatorState = Terminal.EmulatorState.create({
    'fs': customFileSystem,
    'commandMapping': customCommandMapping
});

const historyKeyboardPlugin = new Terminal.HistoryKeyboardPlugin(emulatorState);
const plugins = [historyKeyboardPlugin];

addKeyDownListener('Enter', viewRefs.input, () => {
    const commandStr = getInput();
    
    emulatorState = emulator.execute(emulatorState, commandStr, plugins);
    displayOutputs(emulatorState.getOutputs());
    scrollToPageEnd();
    clearInput();
});

addKeyDownListener('ArrowUp', viewRefs.input, () => {
    setInput(historyKeyboardPlugin.completeUp());
});

addKeyDownListener('ArrowDown', viewRefs.input, () => {
    setInput(historyKeyboardPlugin.completeDown());
});

addKeyDownListener('Tab', viewRefs.input, () => {
    const autoCompletionStr = emulator.autocomplete(emulatorState, getInput());
    
    setInput(autoCompletionStr);
});
