/*! *****************************************************************************
Copyright (c) taoyongwen. All rights reserved.

mac touchbar
***************************************************************************** */
import { BrowserWindow, TouchBar } from "electron";
import * as path from "path";
const { TouchBarLabel,TouchBarGroup,TouchBarColorPicker, TouchBarButton, TouchBarSpacer } = TouchBar
export function touchBarHub(mainWindow:BrowserWindow){
    const nativeImage = require('electron').nativeImage;
    mainWindow.setTouchBar(new TouchBar({
        items:[
          new TouchBarButton({
            icon:nativeImage.createFromPath( path.join(__dirname, '../../../touchBar/back.png')),
            backgroundColor: '#9400d3',
            click: () => {
                mainWindow.webContents.send("touchBar_back");
            }
           }),
           new TouchBarButton({
            icon:nativeImage.createFromPath( path.join(__dirname, '../../../touchBar/open.png')),
            backgroundColor: '#9400d3',
            click: () => {
                mainWindow.webContents.send("touchBar_open");
            }
           }),
           new TouchBarButton({
            icon:nativeImage.createFromPath( path.join(__dirname, '../../../touchBar/new.png')),
            backgroundColor: '#9400d3',
            click: () => {
                mainWindow.webContents.send("touchBar_new");
            }
           }),
           new TouchBarButton({
            icon:nativeImage.createFromPath( path.join(__dirname, '../../../touchBar/git.png')),
            backgroundColor: '#9400d3',
            click: () => {
                mainWindow.webContents.send("touchBar_git");
            }
           }),
        ]
        }))

}

export function touchBarEditor(mainWindow:BrowserWindow){
    const nativeImage = require('electron').nativeImage;
    mainWindow.setTouchBar(new TouchBar({
        items:[
          new TouchBarButton({
            icon:nativeImage.createFromPath( path.join(__dirname, '../../../touchBar/savepage.png')),
            backgroundColor: '#9400d3',
            click: () => {
                mainWindow.webContents.send("touchBar_save");
            }
           }),
           new TouchBarButton({
            icon:nativeImage.createFromPath( path.join(__dirname, '../../../touchBar/fresh.png')),
            backgroundColor: '#9400d3',
            click: () => {
                mainWindow.webContents.send("touchBar_fresh");
            }
           }),
           new TouchBarButton({
            icon:nativeImage.createFromPath( path.join(__dirname, '../../../touchBar/build.png')),
            backgroundColor: '#9400d3',
            click: () => {
                mainWindow.webContents.send("touchBar_build");
            }
           }),
           new TouchBarButton({
            icon:nativeImage.createFromPath( path.join(__dirname, '../../../touchBar/preview.png')),
            backgroundColor: '#9400d3',
            click: () => {
                mainWindow.webContents.send("touchBar_preview");
            }
           }),
           new TouchBarButton({
            icon:nativeImage.createFromPath( path.join(__dirname, '../../../touchBar/export.png')),
            backgroundColor: '#9400d3',
            click: () => {
                mainWindow.webContents.send("touchBar_export");
            }
           }),
        ]
        }))

}
export function touchBarColors(mainWindow:BrowserWindow){
    const nativeImage = require('electron').nativeImage;
    mainWindow.setTouchBar(new TouchBar({
        items:[
         
           new TouchBarColorPicker({
            change(color) {
                mainWindow.webContents.send("touchBar_color",color);
            },
           }),
        ]
        }))

}