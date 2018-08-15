var React = require("react");
var ReactDOM = require("react-dom");
var ReactCountdownClock = require('react-countdown-clock');
var Animation = require('./Animation');
var Results = require('./Results');
var Circle = require('./Circle');
var Statistics = require('./Statistics');
var crossStorage = require('cross-storage');
var moment = require('moment');

var CrossStorageClient = crossStorage.CrossStorageClient;
var CrossStorageHub = crossStorage.CrossStorageHub;



class Scene extends React.Component {    
    constructor(props){
        super(props);
        this.state = {
            component: null,
            RemainingTime : 0 ,
            numbers : []        
        };
        
    }
    
    componentDidMount() {
        /*CrossStorageHub.init([
            {origin: /./, allow: ['get', 'set', 'del', 'getKeys', 'clear']}
        ]);*/
       
        if(localStorage.getItem("scene") !== null){
            let scene = localStorage.getItem("scene");
            this[scene]();
        }
        else
            this.RenderCountdownScene();        
    }

    setCurrentScene = (sceneName) => {
        localStorage.setItem("scene", sceneName);
    };
    
    clearLocalStorageKey = (key) => {
        localStorage.removeItem(key);
    };
    
    getRemainingTime = ($date) => {
        
        let nextStart = moment($date,'DD/MM/YYYY hh:mm:ss');
        var now  = moment();

        let remainingTimeInSec = nextStart.diff(now, 'seconds');
        
        return remainingTimeInSec;//remainingTimeInSec < 0 ? 0 : remainingTimeInSec;
    };

    RenderCountdownScene = () => {         
        this.clearLocalStorageKey("numbersInProgress");
        this.setCurrentScene("RenderCountdownScene");
        
        let fitByResolution = 500; // 500ps is default, when height is lower then 1080px (HD ready)
        
        if(window.screen.availHeight > 1079 && window.screen.availHeight < 2160)
        {
            fitByResolution = fitByResolution + fitByResolution/2;
        }
        if(window.screen.availHeight > 2159)
        {
            fitByResolution = (fitByResolution + fitByResolution/2) * 2;
        }

        fetch("api/GetData")
          .then(res => res.json())
          .then(
            (result) => {              
              let seconds =  this.getRemainingTime(result.root.NextStart);
              this.setState({ component : <div>
                         <ReactCountdownClock seconds={10}
                         color="#4fc3f7"
                         alpha={0.9}
                         showMilliseconds = false
                         size={fitByResolution}
                         onComplete={this.RenderAnimationScene} />
                         </div>});
            },
            (error) => {
              console.log(error);
            }
          )       
    }
    
    RenderAnimationScene = () => {
        this.setCurrentScene("RenderAnimationScene");

        //--- get remaining time for counter
         fetch("api/GetData")
          .then(res => res.json())
          .then(
            (result) => {
              let numbers = [...result.root.NextNumbers.split(',')];// result.root.NextNumbers.split(",");
              console.log('numbers: ' + numbers);
              this.setState({ component : <Animation data={result.root} numbers={numbers} onComplete = {this.RenderLastThreeResultsScene} /*onTimerExpired={this.RenderCountdownScene}*/ /> })              
            },
            (error) => {
              console.log(error);
            }
          )
    }
   RenderLastThreeResultsScene = () => {
        this.setCurrentScene("RenderLastThreeResultsScene");
        this.clearLocalStorageKey("numbersInProgress");

        fetch("api/GetData")
          .then(res => res.json())
          .then((result) => {
              console.log('GetData returns: ' + result);
              let lastThree = result.root.PreviusGameNumbers.numbers;
              let seconds =  this.getRemainingTime(result.root.NextStart);
              let sceneTime = result.root.SceneTime.RenderLastThreeResultsScene;
              console.log('scene time: ' + sceneTime);

              this.setState({ component : <Results lastThree={lastThree} remainingTime={15} sceneTime={sceneTime} onComplete = {this.RenderStatisticsScene} onTimerExpired={this.RenderStatisticsScene} /> })              
            },
            (error) => {
              console.log(error);
            }
          )        
   }

   RenderStatisticsScene = () => {
        this.setCurrentScene("RenderStatisticsScene");
        this.clearLocalStorageKey("numbersInProgress");

        fetch("api/GetData")
          .then(res => res.json())
          .then((result) => {
              console.log('GetData returns: ' + result);
              let lastThree = result.root.PreviusGameNumbers.numbers;
              let seconds =  this.getRemainingTime(result.root.NextStart);
              let sceneTime = result.root.SceneTime.RenderStatisticsScene;
              console.log('scene time: ' + sceneTime);
              this.setState({ component : 
                    <Statistics  remainingTime={15} sceneTime={sceneTime}onComplete = {this.RenderCountdownScene}  onTimerExpired={this.RenderCountdownScene} />
              })             
            },
            (error) => {
              console.log(error);
            }
        )          
   }
        
    render() {
        return(
             <div>
              {this.state.component} 
             </div>          
        )        
    }
}

module.exports = Scene;