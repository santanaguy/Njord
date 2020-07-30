# Njord
Njord aims to be a GIS application created to allow the design of scenarios that describe a simulation and the interactions between multiple targets on a highly interactive and intuitive GUI.

![image](/screenshot.png?raw=true)

First you draw a scenario. Then you get the JSON describing your scenario in detail. Finally you replay it on a simulator (TBD).

# Origin

This project was born from a university project in which we were free to choose the theme we wanted to tackle. Since i've worked for some years on the development of naval systems and I wanted to try new technologies, I set off to start working in a GUI that could allow me to configure complex scenarios easily that would enable easier testing in my day-to-day work.

# Purpose

Generating complex, repeatable scenarios is a major pain in the ass while testing anything GIS related such as VTS systems. 
For that purpose, generally you want a simulator that allows you to create those scenarios and that is able to replay them by outputing positions from the targets as configured at the right times. Njord aims to be the place where you create the scenarios and will eventually be able to replay them with a variety of outputs.
 
# Objectives

There are a couple of pretty big objectives that I would like to achieve with this project. 

1. Like I mentioned, this is came from a university project and it uses technologies i'm still learning. So the first objective is to look at what I have so far and improve it without introducing any features. This includes:

   * Updating the versions of libraries
   * Refactoring to have better code 
   * Check out a couple of concepts and techniques (eg: immutability)
   * Adding some docs for the most common features

2. Start working on the simulator backend with the already existent concepts. I would like to create a simulator capable of emiting standards like:
   
   * NMEA 0183 (AIS)
   * ADS-B
   * ASTERIX CAT 010/042
   * Custom format allowing any application

# Concepts

![image](/screenshot.png?raw=true)

Currently there are already some concepts introduced in the GUI. It is already possible to design complex scenarios and generate a JSON describing such scenarios:

1. Targets - These are abractions that represent objects over the map. A target could be a ship, a plane or even an echo from a radar which is unidentified. 

2. Position Generators - Each target has a set of Position Generators that emit positions at a fixed rate. The positions have associated properties which can vary from one Position Generator to another.

3. Replay mode - A simple replay mode that allows you to preview the scenario you created.