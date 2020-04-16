<template>
  <div class="hero-cli">

    <h1>{{ title }}
      <small v-show="version">{{version}}</small>
    </h1>

    <div class="hero-cli__wrapper">
      <div class="console mdl-shadow--4dp">
        <div class="console__head">
          <div class="console__dot console__dot--red"></div>
          <div class="console__dot console__dot--yellow"></div>
          <div class="console__dot console__dot--green"></div>
        </div>
        <div class="console__body">
          <kbd class="console__prompt">npm install -g @tsed/cli</kbd>
          <kbd class="console__prompt">tsed init .</kbd>
          <kbd class="console__prompt">npm start</kbd>
        </div>
      </div>

      <div>
        <p class="hero-banner__description">
          {{ description }}
        </p>

        <slot></slot>
      </div>
    </div>


  </div>
</template>
<script>
  export default {
    name: 'HeroCli',
    props: {
      title: {
        type: String,
        required: true
      },
      version: {
        type: String,
        required: false
      },
      description: {
        type: String,
        required: true
      },
      terms: {
        type: Array,
        required: false
      },
      logoSrc: {
        type: String,
        required: false
      }
    },
    computed: {
      info () {
        return {
          title: this.title,
          version: this.version,
          description: this.description
        }
      }
    }
  }
</script>
<style>
  .console {
    width: 360px;
    max-width: 92vw;
    margin: auto;
    margin-top: 30px;
    margin-bottom: 10px;
    text-align: left;
    border-radius: 5px;
    box-shadow: 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 10px 0 rgba(0, 0, 0, .12), 0 2px 4px -1px rgba(0, 0, 0, .2);
    color: #fff;
  }

  .console__head {
    overflow: hidden;
    background-color: #d5d5d5;
    padding: 8px 15px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }

  .console__dot {
    float: left;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 7px;
    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, .2);
  }

  .console__dot--red {
    background-color: #ff6057;
  }

  .console__dot--yellow {
    background-color: #ffc22e;
  }

  .console__dot--green {
    background-color: #28ca40;
  }

  .console__body {
    background-color: #1e1e1e;
    padding: 30px 17px 20px;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }

  .console__prompt {
    display: block;
    margin-bottom: 15px;
    font-family: "Source Code Pro", monospace;
    font-size: 15px;
    background: 0;
    border: 0;
  }

  .console__prompt::before {
    content: ">";
    padding-right: 15px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .hero-banner .hero-cli h1 {
  }

  .hero-cli__wrapper {
    display: flex;
    max-width: 800px;
    margin: auto;
  }

  .hero-cli .hero-banner__description {
    text-align: left;
  }

  .home__actions .button {
    margin-left: 0;
  }
</style>
