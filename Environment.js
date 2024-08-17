class Environment {
    constructor() {
      this.gravityAcc = 9.8;
      this.waterDensity = 1025;
      this.fraction_constant = 0.02;
    }

    
      calculateWieghtForce(mass) {
          return this.gravityAcc * mass ;
        }

    calculateArchimedesForce(volume) {
      return this.waterDensity * this.gravityAcc * volume;
    }

    
    calculatePreacherForce(depth) {
        return this.waterDensity * this.gravityAcc * depth;
      }
      
      calculateFrictionForce(velocity) {
        
        const dragForceX = -0.5 * this.fraction_constant * this.waterDensity * this.projectedAreas[0] * velocity.x * velocity.x;
        const dragForceY = -0.5 * this.fraction_constant * this.waterDensity * this.projectedAreas[1] * velocity.y * velocity.y;
        const dragForceZ = -0.5 * this.fraction_constant * this.waterDensity * this.projectedAreas[2] * velocity.z * velocity.z;

        return new THREE.Vector3(dragForceX, dragForceY, dragForceZ);
    }
      
      



}export {Environment}
