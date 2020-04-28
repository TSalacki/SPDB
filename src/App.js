import React from "react";
import L from 'leaflet';
import "./App.css";
import AutosizeInput from 'react-input-autosize'
var overpass = require("query-overpass")

require('leaflet-routing-machine'); // Adds L.Routing onto L
require('lrm-graphhopper'); // Adds L.Routing.GraphHopper onto L.Routing

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      activeMapFeature: null,
      searchedPlace: "",
      mapData: null,
      query: "[out:json];node(57.7,11.9,57.8,12.0)[amenity=bar];out;",
      mapCenter: [0.0, 0.0],
      map: null,
      geoJsonLayer: null
    };
    this.handleChange = this.handleChange.bind(this);
    this.searchPlace = this.searchPlace.bind(this);
    this.callback = this.callback.bind(this);
  }

  handleChange(event){
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }else if(feature.properties && feature.properties.tags.name){
      	layer.bindPopup(feature.properties.tags.name);
    }
  }

  callback(error, data){
    if(error){
      alert("error: " + error);
    }
    else{
      var geoJsonLayer = L.geoJSON(data, {onEachFeature: this.onEachFeature});
      
      this.state.geoJsonLayer.clearLayers();
      geoJsonLayer.addTo(this.state.map);
      this.setState({
        mapData: data,
        //result: JSON.stringify(data),
        geoJsonLayer: geoJsonLayer
      });
    }
  }

  searchPlace(event){
    overpass(this.state.query, this.callback);
  }

  componentDidMount(){
    var map = L.map('map').setView([39.74739, -105], 3);

    // L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}{r}.png', {
    //   attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    // }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 18,
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
			id: 'mapbox/light-v9'
    }).addTo(map);
  
    L.Routing.control({
        waypoints: [
            L.latLng(57.74, 11.94),
            L.latLng(57.6792, 11.949)
        ],
        routeWhileDragging: true,
        router: L.Routing.graphHopper('9f251f13-8860-4ec1-b248-29334abc9e46'),
    }).addTo(map);

    var geoJsonLayer = L.geoJSON();
    geoJsonLayer.addTo(map)

    this.setState({
      map: map,
      geoJsonLayer: geoJsonLayer
    })
  }

  render(){

    return (
      <div>
        <div>
          <input type="textbox" onChange={this.handleChange} name="searchedPlace"></input>
        </div>
        <div>
          <label>Searched Place: </label>
          <label>{this.state.searchedPlace}</label>
        </div>
        <br />
        <div>
          <AutosizeInput onChange={this.handleChange} name="query" value={this.state.query}/>
          <button onClick = {this.searchPlace}>Search</button>
        </div>
        <div>
          <label>Active Feature: </label>
          <br />
          <label>{JSON.stringify(this.state.activeMapFeature)}</label>
        </div>
        <div class = "container">
          <div id="map"></div>
        </div>
      </div>
    );
  }
}

export default App;
