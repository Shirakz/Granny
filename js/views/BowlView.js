/*global granny, $, _, Backbone*/
window.granny = window.granny || {};

granny.BowlView = Backbone.View.extend({

    // entry point
    initialize: function () {
        // pass "this" referring to this object to the listed methods instead of the default "this"
        _.bindAll(this, 'moveLeft', 'moveRight', 'addCannon', 'fallCannon', 'missCannon', 'catchWater', 'addEnergy', 'kill', 'endTurn');

        this.world = granny.World;
        
        // instance the models
        this.model = new granny.Bowl();
        this.cannons = new granny.Cannons();

        this.model.set({
            positionY: this.world.get('height') - this.model.get('height')  + 12
        });

        this.event_aggregator.bind('catch:water', this.catchWater);
        this.event_aggregator.bind('miss:water', this.kill);
        this.event_aggregator.bind('add:cannon', this.addCannon);
        this.event_aggregator.bind('miss:cannon', this.missCannon);
        this.event_aggregator.bind('end:turn', this.endTurn);
        this.event_aggregator.bind('key:leftarrow', this.moveLeft);
        this.event_aggregator.bind('key:rightarrow', this.moveRight);
        
    },


    moveLeft: function () {
        var speed = this.model.get('speed'),
            x = this.model.get('positionX'),
            marginLeft = this.model.get('marginLeft');

        if (x > marginLeft) {
            this.model.set({positionX: x - speed});
        }

    },


    moveRight: function () {
        var speed = this.model.get('speed'),
            x = this.model.get('positionX'),
            marginRight = this.model.get('marginRight'),
            bowlWidth = this.model.get('width'),
            worldWidth = this.world.get('width');

        if (x < worldWidth - bowlWidth - marginRight) {
            this.model.set({positionX: x + speed});
        }

    },

    
    addCannon: function () {
        var energy = this.model.get('energy'),
            bowlX =  this.model.get('positionX'),
            cannon;

        if (energy < 5) {
            return;
        }

        cannon = new granny.Cannon();
        
        cannon.set({positionX: bowlX});

        this.model.set({energy: 0});

        this.cannons.add(cannon);
        this.event_aggregator.trigger('addCannon', cannon);
    },


    fallCannon: function (cannon) {
        var cannonY = cannon.get('positionY'),
            speed = cannon.get('speed');

        cannon.set({positionY: cannonY - speed});
    },


    missCannon: function (cannon) {
        cannon.destroy();
    },
    
    
    catchWater: function (water) {
        var that = this,
            image = this.model.get('currentImage') + 1,
            animationId,
            prevImage = 7;
        this.addEnergy(1);
        
        if (image > 5) {
            // avoid going to 8 when catching and being in 7
            image = 6;

            // water splash animation
            animationId = setInterval(function () {
                image = prevImage === 7 ? 7 : 6;
                prevImage = image === 7 ? 6 : 7;
                console.log(image);
                console.log(prevImage);
                that.model.set({
                    currentImage: image, 
                    positionY: that.world.get('height') - that.model.get('height')  - 9
                });
            }, 250);
            
            setTimeout(function () {
            
                clearTimeout(animationId);
                that.model.set({
                    currentImage: that.model.get('energy'),
                    positionY: that.world.get('height') - that.model.get('height')  + 12
                });
                
            }, 1000);
        } else {
            this.model.set({currentImage: image});
        }
    },
    
    
    addEnergy: function (n) {
        var energy = this.model.get('energy');

        energy += n;

        this.model.set({energy: energy});

        console.log('bowl energy: ' + this.model.get('energy'));
    },


    kill: function () {
        var lifes = this.model.get('lifes') - 1;
        
        this.model.set({lifes: lifes});

        console.log('bowl died! lifes: ' + this.model.get('lifes'));
    },

    
    endTurn: function () {
        this.cannons.reset();
        this.model.reset(['positionX', 'speed', 'energy']);
    }
});