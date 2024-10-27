/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file This code is compiled and executed in the "game" place on the server
 */

import setupEvents from "./events";
import { setupGameInfo } from "./gameinfo";
import { WaveFunctionCollapseActor } from "./wfc/wfc";

WaveFunctionCollapseActor.SendMessage("StartWaveFunctionCollapse");
setupEvents();
setupGameInfo();