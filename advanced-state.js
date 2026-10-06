/* Deterministic teaching state. No claim of torque/contact simulation. */
(function(root){
 class WatchAdvancedState{
 constructor(){this.reset();}
 reset(){this.date=1;this.dateTurns=0;this.datePulse=0;this.lastClock=0;this.rotor=0;this.rectified=0;this.rotorDirection=1;this.slipping=false;this.elapsed=0;this.running=false;this.column=0;this.hammer=0;this.resetFrom=0;this.lastMessage='';}
 rotorMove(delta,charge){this.rotor+=delta;this.rotorDirection=Math.sign(delta)||this.rotorDirection;this.rectified+=Math.abs(delta);const requested=Math.abs(delta)/(2*Math.PI)*(100/45);this.slipping=charge+requested>=100;return Math.min(100-charge,requested);}
 observeClock(total){const crossed=Math.floor((total+1e-7)/86400)-Math.floor((this.lastClock+1e-7)/86400);if(total>=this.lastClock&&crossed>0)this.nextDate(crossed);this.lastClock=total;}
 nextDate(n=1){this.date=(this.date-1+n)%31+1;this.dateTurns+=n;this.datePulse=1;}
 setDate(n){this.date=n;this.dateTurns=n-1;this.datePulse=1;}
 canQuickset(){const h=((this.lastClock%86400)+86400)%86400/3600;return h>=3&&h<21;}
 quickDate(direction){if(direction<0)return false;if(!this.canQuickset()){this.lastMessage='날짜 맞물림 구간 · 이 교육 모델은 21:00–03:00 빠른 조정을 잠급니다.';return false;}this.nextDate();this.lastMessage='용두 → 날짜 조정 레버 → 날짜판 한 칸';return true;}
 // Chronograph state is mirrored by advanced.js from SeikoChronograph.Controller.
 animate(dt){this.datePulse=Math.max(0,this.datePulse-dt*2);}
 }
 if(typeof module!=='undefined'&&module.exports)module.exports=WatchAdvancedState;else root.WatchAdvancedState=WatchAdvancedState;
})(typeof window!=='undefined'?window:globalThis);
