﻿/*

Markets are a function of time. When watching them, end users must be positioned at one particular point in time. The system currently allows users
to position themselves at any time they like.

In the future, it will be usefull to explore markets and compare them at different times simultaneously. Anticipating that future this module exists.
All the charts that depand on a datetime are children of this object Time Machine. In the future we will allow users to have more than one Time Machine,
each one with it own charts, and each one positioned at an especific point in titme. 

*/

function newTimeMachine() {

    let thisObject = {
        container: undefined,
        draw: draw,
        charts: [],
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize
    };

    let container = newContainer();
    container.initialize();
    thisObject.container = container;
    thisObject.container.isDraggeable = false;

    container.displacement.containerName = "Time Machine";
    container.frame.containerName = "Time Machine";

    let controlPanelHandle;             // We need this to destroy the Panel when this object is itself destroyed or no longer needs it...
    let productsPanelHandle;            // ... also to request a reference to the object for the cases we need it. 

    return thisObject;

    function initialize() {

        /* Each Time Machine has a Control Panel. */

        controlPanelHandle = canvas.panelsSpace.createNewPanel("Time Control Panel");
        let controlPanel = canvas.panelsSpace.getPanel(controlPanelHandle);

        productsPanelHandle = canvas.panelsSpace.createNewPanel("Products Panel");
        let productsPanel = canvas.panelsSpace.getPanel(productsPanelHandle);

        let iteration = 0;

        /* First, we initialize the market that we are going to show first on screen. Later all the other markets will be initialized on the background. */

        let timelineChart = newTimelineChart();

        timelineChart.container.displacement.parentDisplacement = thisObject.container.displacement;
        timelineChart.container.frame.parentFrame = thisObject.container.frame;

        timelineChart.container.parentContainer = thisObject.container;

        timelineChart.container.frame.width = thisObject.container.frame.width * 1;
        timelineChart.container.frame.height = thisObject.container.frame.height * 1 * CHART_ASPECT_RATIO;

        timelineChart.container.frame.position.x = thisObject.container.frame.width / 2 - timelineChart.container.frame.width / 2;
        timelineChart.container.frame.position.y = timelineChart.container.frame.height * 1.5 * iteration;

        timelineChart.initialize(1, INITIAL_DEFAULT_MARKET, productsPanel, onDefaultMarketInitialized);

        iteration++;

        function onDefaultMarketInitialized() {

            thisObject.charts.push(timelineChart);

            controlPanel.container.eventHandler.listenToEvent('Datetime Changed', timelineChart.setDatetime, undefined);
            timelineChart.container.eventHandler.listenToEvent('Datetime Changed', controlPanel.setDatetime);

            initializeTheRestOfTheMarkets();

        }

        function initializeTheRestOfTheMarkets() {

            markets.forEach(initializeTimelineChart);

            function initializeTimelineChart(item, key, mapObj) {

                if (key === INITIAL_DEFAULT_MARKET) { // We skip this market since it has already been initialized.

                    return;
                }

                let timelineChart = newTimelineChart();

                timelineChart.container.displacement.parentDisplacement = thisObject.container.displacement;
                timelineChart.container.frame.parentFrame = thisObject.container.frame;

                timelineChart.container.parentContainer = thisObject.container;

                timelineChart.container.frame.width = thisObject.container.frame.width * 1;
                timelineChart.container.frame.height = thisObject.container.frame.height * 1 * CHART_ASPECT_RATIO;

                timelineChart.container.frame.position.x = thisObject.container.frame.width / 2 - timelineChart.container.frame.width / 2;
                timelineChart.container.frame.position.y = timelineChart.container.frame.height * 1.5 * iteration;

                timelineChart.initialize(1, key, productsPanel, finalSteps);

                iteration++;

                function finalSteps() {

                    thisObject.charts.push(timelineChart);

                    controlPanel.container.eventHandler.listenToEvent('Datetime Changed', timelineChart.setDatetime, undefined);
                    timelineChart.container.eventHandler.listenToEvent('Datetime Changed', controlPanel.setDatetime);

                }
            }
        }
    }

    function draw() {

        this.container.frame.draw(false, false);

        /* When we draw a time machine, that means also to draw all the charts in it. */

        for (let i = 0; i < this.charts.length; i++) {

            let chart = this.charts[i];
            chart.draw();

        }
    }

    function getContainer(point) {

        let container;

        /* First we check if this point is inside this space. */

        if (this.container.frame.isThisPointHere(point) === true) {

            /* Now we see which is the inner most container that has it */

            for (let i = 0; i < this.charts.length; i++) {

                container = this.charts[i].getContainer(point);

                if (container !== undefined) {

                    /* We found an inner container which has the point. We return it. */

                    return container;
                }
            }
            
            /* The point does not belong to any inner container, so we return the current container. */

            return this.container;

        } else {

            /* This point does not belong to this space. */

            return undefined;
        }
    }
}