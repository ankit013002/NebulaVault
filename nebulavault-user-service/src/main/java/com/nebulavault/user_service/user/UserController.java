package com.nebulavault.user_service.user;

import com.nebulavault.user_service.user.dto.BootstrapResponse;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

@RestController
@RequestMapping("/user")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }

    @PostMapping("/bootstrap")
    public ResponseEntity<BootstrapResponse> bootstrap(
            @RequestHeader("X-User-AuthSub") String authSub,
            @RequestHeader("X-User-Email") String email,
            @RequestHeader(value = "X-User-Name", required = false) String name
    ){
        var user = userService.bootstrap(authSub, email, name);
        return ResponseEntity.ok(new BootstrapResponse(true, user.getId(), user.getPlan(), user.getQuotaBytes(), user.getUsedBytes()));
    }

    @GetMapping("/me")
    public User me(@RequestHeader("X-User-AuthSub") String authSub) {
        return userService.meByAuthSub(authSub);
    }
}
