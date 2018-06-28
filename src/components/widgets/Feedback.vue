<template>
  <div class="box">
    <div class="field">
      <label class="label">Subject</label>
      <div class="control">
        <div class="select">
          <select>
            <option>I like it!</option>
            <option>I don't like it</option>
          </select>
        </div>
      </div>
    </div>

    <div class="field">
      <label class="label">Message</label>
      <div class="control">
        <textarea class="textarea" placeholder="Textarea"></textarea>
      </div>
    </div>

    <div class="field is-grouped">
      <div class="control">
        <button class="button is-link">Submit</button>
      </div>
      <div class="control">
        <router-link :to="{name: 'dashboard'}" class="button is-text">Cancel</router-link>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'widget-feedback',
    methods: {}
  };
</script>
