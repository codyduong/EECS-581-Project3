--[[

This is a file which points to DocumentService

https://github.com/anthony0br/DocumentService/

Authored by: Cody Duong <cody.qd@gmail.com>

]]--

local DocumentService = require(game:GetService("ReplicatedStorage")["Packages"]["DocumentService"])

return {
  default = DocumentService,
  DocumentStore = DocumentService.DocumentStore,
  Document = DocumentService.Document,
  SaveUtil = DocumentService.SaveUtil,
}