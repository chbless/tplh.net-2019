import * as THREE from 'three';
import { easeOutExpo } from 'easing-js';
import MathEx from 'js-util/MathEx';

import vs from '@/webgl/glsl/Petal.vs';
import fs from '@/webgl/glsl/Petal.fs';

const DURATION = 3;

export default class Petal extends THREE.Mesh {
  constructor(geometry) {
    // Define Material
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        time: {
          type: 'f',
          value: 0
        },
        noiseTex: {
          type: 't',
          value: null
        },
        alphaShow: {
          type: 'f',
          value: 0
        },
        alphaColor: {
          type: 'f',
          value: 0
        },
      },
      vertexShader: vs,
      fragmentShader: fs,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    // Create Object3D
    super(geometry, material);
    this.name = 'Petal';
    this.mass = Math.random();
    this.rotateDirection = Math.round(Math.random()) * 2 - 1;
    this.timeRotate = 0;
    this.timeRotateWorld = Math.random();
    this.scale.set(
      this.mass * 0.7 + 0.7,
      this.mass * 0.7 + 0.7,
      this.mass * 0.7 + 0.7
    );
   this.rotation.set(
      MathEx.radians((Math.random() * 2 - 1) * 60),
      0,
      MathEx.radians((Math.random() * 2 - 1) * 60)
    );
    this.axisBodyRotate = new THREE.Vector3().copy(this.up).applyEuler(this.rotation);
    this.quaternionPrev = new THREE.Quaternion();
    this.timeChanged = 0;
    this.alphaStart = 0;
    this.alphaEnd = 0;
    this.isActive = false;
    this.isChanged = false;
  }
  start(noiseTex) {
    this.isActive = true;
    this.material.uniforms.noiseTex.value = noiseTex;
  }
  update(time) {
    if (this.isActive === false) return;

    // rotate with a quaternion.
    this.quaternionPrev.copy(this.quaternion);
    this.quaternion.setFromAxisAngle(
      this.axisBodyRotate,
      time * this.rotateDirection * (1 - this.mass)
    ).multiply(this.quaternionPrev);

    if (this.isChanged === true) {
      this.timeChanged += time;
      this.material.uniforms.alphaColor.value =
        this.alphaStart + easeOutExpo(
          MathEx.clamp(this.timeChanged / DURATION, 0.0, 1.0)
        ) * (this.alphaEnd - this.alphaStart);
      if (this.timeChanged >= DURATION) {
        this.timeChanged = 0;
        this.isChanged = false;
      }
    }

    this.material.uniforms.time.value += time;
  }
  changeColorDark(bool) {
    this.alphaStart = this.material.uniforms.alphaColor.value;
    this.alphaEnd = (bool === true) ? 1 : 0;
    this.timeRotate = 0;
    this.timeChanged = 0;
    this.isChanged = true;
  }
}