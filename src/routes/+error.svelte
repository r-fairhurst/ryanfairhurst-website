<script lang="ts">
    import {page} from '$app/stores';
</script>

<div class="terminal-wrapper">
    <h1>Error { $page.status }</h1>
    <p>{ $page.error?.message }</p>
</div>
