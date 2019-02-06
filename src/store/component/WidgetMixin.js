/**
 * Copyright 2019 ThinxNet GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export default {
  namespaced: true,
  state: {
    feedbackFormPayload: null,
    feedbackFormReference: null,
    uiFeedbackForm: false
  },
  getters: {
    feedbackFormPayload: state => state.feedbackFormPayload,
    feedbackFormReference: state => state.feedbackFormReference,
    isFeedbackFormActive: state => state.uiFeedbackForm
  },
  mutations: {
    feedbackFormActivate: (state, params) => {
      state.feedbackFormPayload = params.payload;
      state.feedbackFormReference = params.widgetId;
      state.uiFeedbackForm = true;
    },
    feedbackFormDiscard: state => {
      state.feedbackFormPayload = null;
      state.feedbackFormReference = null;
      state.uiFeedbackForm = false;
    }
  },
  actions: {
    feedbackFormActivate: (ctx, params) => {
      ctx.commit("feedbackFormActivate", params);
    },
    feedbackFormDiscard: ctx => {
      ctx.commit("feedbackFormDiscard", null);
    }
  }
};
