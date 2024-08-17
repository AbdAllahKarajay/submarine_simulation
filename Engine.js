class Engine {
    constructor(power,max_fan_speed,fan_speed) {
      this.power = power;
      this.max_fan_speed=max_fan_speed ;
      this.fan_speed = fan_speed;
    }

    Engine_thrust(){
      return this.power * this.fan_speed ;
    }

}
