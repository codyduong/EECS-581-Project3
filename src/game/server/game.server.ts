/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file This code is compiled and executed in the "game" place on the server
 */

const l = script.Parent?.FindFirstChild("wfc") as Actor;
l.SendMessage("Fire");
l.SendMessage("Fire2");
l.SendMessage("Fire3");
