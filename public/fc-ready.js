(function(){
  var done=false;
  var tries=0;
  function doReady(){
    if(done||tries>30)return;
    tries++;
    try{
      if(window.miniapp&&window.miniapp.sdk){
        done=true;
        window.miniapp.sdk.actions.ready().catch(function(){});
      }else{
        setTimeout(doReady,200);
      }
    }catch(e){setTimeout(doReady,200);}
  }
  doReady();
})();
