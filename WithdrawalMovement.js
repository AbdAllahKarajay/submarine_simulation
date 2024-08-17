import { Vector3 } from "three";

class WithdrawalMovement {
    constructor() {
        this.empty_mass = 1394//1609.25; // mass of the submarine in kg
        this.power = 200; // power of the engine in some units
        this.waterDensity = 1025; // density of water in kg/m^3
        this.gravityAcc = 9.81; // acceleration due to gravity in m/s^2
        this.fraction_constant = 0.02;
        this.projectedAreas = [2.1, 2.1,3.6]; // Areas should not be empty, assume some default values
        this.deltaTime = 0.05;
        this.velocity = new Vector3(0, 0, 0);
        this.position = new Vector3(0, 0, 0);
        this.acceleration = new Vector3(0, 0, 0);
        this.maxDepth = 1000; // maximum depth limit
        this.volume = 1.56; // Volume of the submarine in cubic meters
        this.pressureThreshold = 1.1; // Threshold ratio for pressure vs gravity force
        this.warningDepthThreshold = 110;
        this.errorState = false; // New state to handle error
    }

    // Weight force due to gravity
    calculateWeightForce(tanks_water_volume) {
        const tanks_water_mass = tanks_water_volume * this.waterDensity;
        return new Vector3(0, -this.gravityAcc * (this.empty_mass + tanks_water_mass) , 0);
    }

    // Engine thrust force
    engineThrust(fan_speed) {
        return new Vector3(0, 0, this.power * fan_speed);
    }

    // Archimedes' force (buoyant force)
    calculateArchimedesForce() {
        return new Vector3(0, this.waterDensity * this.gravityAcc * this.volume, 0);
    }

    // Friction force
    calculateFrictionForce() {
        const dragForceX =- 0.5 * this.fraction_constant * this.waterDensity * this.projectedAreas[0] * this.velocity.x;
        const dragForceY = -0.5 * this.fraction_constant * this.waterDensity * this.projectedAreas[1] * this.velocity.y;
        const dragForceZ =- 0.5 * this.fraction_constant * this.waterDensity * this.projectedAreas[2] * this.velocity.z;

        return new Vector3(dragForceX, dragForceY, dragForceZ);
    }

    // Pressure force due to depth
    calculatePressureForce() {
        const depth =  this.position.y; // Depth is the negative y position
        return new Vector3(0, this.waterDensity * this.gravityAcc * depth , 0);
    }

    // Check if pressure exceeds threshold and display a warning message
    checkPressureWarning() {
        const depth = -this.position.y;
        if (depth > this.warningDepthThreshold && !this.errorState) {
            this.errorState = true; // Activate error state
            this.velocity.set(0, 0, 0); // Stop the submarine
            this.acceleration.set(0, 0, 0); // Stop acceleration

            console.warn('Warning: Descending further may expose the submarine to excessive pressure!');
            alert('Warning: Descending further may expose the submarine to excessive pressure! Please click OK to resume.');
        }
    }

    // Method to resume movement after error state
    resumeMovement() {
        if (this.errorState) {
            this.errorState = false; // Deactivate error state
            console.log('Movement resumed.');
        }
    }


    // Total forces affecting the submarine
    calculateForce(tanks_water_volume, fan_speed, submarinDensity) {
        const engineThrust = this.engineThrust(fan_speed).clone();
        const archimedesForce = this.calculateArchimedesForce().clone();
        const frictionForce = this.calculateFrictionForce().clone(); // Use the current velocity
     //   const pressureForce = this.calculatePressureForce().clone();

        const weightForce = this.calculateWeightForce(tanks_water_volume).clone();
      //  console.log(pressureForce);       
         
        // return constantVector;
        return archimedesForce.add(weightForce).add(engineThrust).add(frictionForce);
    }
    // Current linear acceleration
    currentLinearAccelerate(tanks_water_volume, fan_speed, submarinDensity) {
        const force = this.calculateForce(tanks_water_volume, fan_speed, submarinDensity);
        this.acceleration.copy(force.divideScalar(this.empty_mass + tanks_water_volume * this.waterDensity));
        // console.log(this.acceleration.y);
        return this.acceleration;
    }

    // Next velocity
    nextVelocity() {
        this.velocity.add(this.acceleration.clone().multiplyScalar(this.deltaTime));
        // console.log(this.velocity.y);
        return this.velocity;
    }

    // Next location
    nextLocation() {
        // console.log("position" + this.position.y);
        this.position.add(this.velocity.clone().multiplyScalar(this.deltaTime));
        return this.position;
    }

    // Check if vertical movement should stop
    shouldStopVerticalMovement() {
        const weightForce = this.calculateWeightForce(0); // Use 0 for tanks_water_volume for this check
        const pressureForce = this.calculatePressureForce();
        // Check if the magnitude of the forces are approximately equal
        return weightForce.y.toFixed(2) === pressureForce.y.toFixed(2);
    }

    // Linear motion at the moment
    linearMotionInMoment(submarine, tanks_water_volume, fan_speed) {
        if (this.errorState) {
            return; // If in error state, don't update position or velocity
        }

        let submarinDensity = 1025 + tanks_water_volume;
        // console.log(submarinDensity);
        fan_speed = - fan_speed ;

    
            this.currentLinearAccelerate(tanks_water_volume, fan_speed);
            this.nextVelocity();
        

        if (!this.shouldStopVerticalMovement()) {
            this.currentLinearAccelerate(tanks_water_volume, fan_speed, submarinDensity);
            this.nextVelocity();
        } else {
            // If the forces are equal, stop vertical movement
            this.velocity.y = 0;
            this.acceleration.y = 0;
        }

        this.nextLocation();
        submarine.position.copy(this.position);
        this.checkPressureWarning();
    }

    
    autoChangeDepth(SubmarineForcers, desired_depth){
        var d = - this.position.y - desired_depth;
        SubmarineForcers["tanks_water_volume"] = 20 - d + this.velocity.y*2;
        if(   SubmarineForcers["tanks_water_volume"]<0)
        {
            SubmarineForcers["tanks_water_volume"] = 0 ;
        }
    }
}

export default WithdrawalMovement;
