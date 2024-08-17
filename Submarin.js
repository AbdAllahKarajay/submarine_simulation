class   Submarin{
    constructor(length,redius,tanks_volume,empty_mass,vetrical_back_fins_area,horizortal_back_fins_center_distance,horizortal_back_fins_area,front_fins_distanse,front_fins_area,Durability,previos_state ) {
   
      this.length = length;
      this.redius=redius ;
      this.volume = this.calculateDisplacementVolume(tanks_volume);
      this.empty_mass=empty_mass;
      this.vetrical_back_fins_area=vetrical_back_fins_area;
      this.horizortal_back_fins_center_distance=horizortal_back_fins_center_distance;
      this.horizortal_back_fins_area=horizortal_back_fins_area;
      this.front_fins_distanse=front_fins_distanse;
      this.front_fins_area=front_fins_area;
      this.Durability=Durability;
      this.previos_state=previos_state;
      this.engine=new Engine();
      this.state=new SubmarinState();
    }
    adjust_water_in_tanks(){
   
    }
    rotate(){

    }
    adjust_engine_fan_speed(){

    }
    colculate_linear_motion(){

    }
    colculate_angular_motion(){

    }
}