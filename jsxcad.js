import { askService, listFiles, deleteFile, setupFilesystem } from './jsxcad-sys.js';
import { buildMeshes, orbitDisplay } from './jsxcad-ui-threejs.js';


//Setup worker
const agent = async ({ ask, question }) => {
  if (question.ask) {
    const { identifier, options } = question.ask;
    return askSys(identifier, options);
  }
};

const serviceSpec = {
  webWorker: './maslowWorker.js',
  agent,
  workerType: 'module',
};

const ask = async (question, context) =>
    askService(serviceSpec, question, context);


//Add 3d view
orbitDisplay({}, document.getElementById("threeJSDisplay")).then(result=>{
    window.updateDisplay = result.updateGeometry
});

setupFilesystem({ fileBase: 'foop' });

//Garbage collection...for now just delete everything
const garbageCollection = async () => {
    console.log("Files: ");
    console.log(await listFiles());
}

//Test some things

let firstReady = false;
let secondReady = false;

const computeDifferenceAndDisplay = () => {
    console.log("First: " + firstReady + " Second: " + secondReady);
    if(firstReady && secondReady){
        ask({ key: "difference", readPath1: "atomGeometry/00005", readPath2: "atomGeometry/00002", writePath: "atomGeometry/00006" }).then(result => {
            ask({ key: "display", readPath: "atomGeometry/00006" }).then(thingReturned => {
                console.log("Returned: ");
                console.log(thingReturned);
                window.updateDisplay(thingReturned);
            })
        })
    }
}

const runTest = async () => {
    
    ask({ key: "circle", diameter:10, writePath: "atomGeometry/00001" }).then(result => {
        ask({ key: "extrude", distance:10, readPath: "atomGeometry/00001", writePath: "atomGeometry/00002" }).then(result => {
            firstReady = true;
            computeDifferenceAndDisplay();
        })
    })
    
    ask({ key: "rectangle", x:10, y:10, writePath: "atomGeometry/00003" }).then(result => {
        ask({ key: "extrude", distance:10, readPath: "atomGeometry/00003", writePath: "atomGeometry/00004" }).then(result => {
            ask({ key: "translate", x:.2, readPath: "atomGeometry/00004", writePath: "atomGeometry/00005" }).then(result => {
                secondReady = true;
                computeDifferenceAndDisplay();
            })
        })
    })
}

setupFilesystem({ fileBase: 'foop' });

garbageCollection();

runTest();
