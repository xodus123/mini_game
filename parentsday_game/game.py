import pygame
import sys
import random

# 초기화
pygame.init()

# 화면 설정
screen_width, screen_height = 800, 600
screen = pygame.display.set_mode((screen_width, screen_height))
pygame.display.set_caption("달려라 짱구")

# 이미지 불러오기 + 크기 조정
background = pygame.image.load('background.png')
background = pygame.transform.scale(background, (screen_width, screen_height))

background_after = pygame.image.load('background2.png').convert_alpha()
background_after = pygame.transform.scale(background_after, (screen_width, screen_height))

player = pygame.image.load('player.png').convert_alpha()
player = pygame.transform.scale(player, (70, 70))

bush_img = pygame.image.load('bush.png').convert_alpha()
bush_img = pygame.transform.scale(bush_img, (60, 60))

# 하트 Surface 만들기
def create_heart_surface(size):
    heart_surf = pygame.Surface((size, size), pygame.SRCALPHA)  # 투명 배경
    red = (255, 0, 0)

    center1 = (size * 1/3, size * 1/3)
    center2 = (size * 2/3, size * 1/3)
    radius = size * 1/3
    point_bottom = (size // 2, size)

    pygame.draw.circle(heart_surf, red, (int(center1[0]), int(center1[1])), int(radius/2))
    pygame.draw.circle(heart_surf, red, (int(center2[0]), int(center2[1])), int(radius/2))
    pygame.draw.polygon(heart_surf, red, [(0, size//3), (size, size//3), point_bottom])

    return heart_surf

# 위치 설정
player_x, player_y = 720, 400

# 덤불 설정
bushes = [
    {"x": 300, "y": 250, "found": False, "is_flower": False},
    {"x": 500, "y": 400, "found": False, "is_flower": False},
    {"x": 100, "y": 350, "found": False, "is_flower": False},
    {"x": 200, "y": 500, "found": False, "is_flower": False},
    {"x": 600, "y": 200, "found": False, "is_flower": False}
]

# 꽃 숨기기
flower_bush = random.choice(bushes)
flower_bush["is_flower"] = True

# 변수들
hearts = []
message = None
background_to_use = background
game_over = False
game_state = "start"  # 시작 화면 상태

# 폰트
font = pygame.font.Font('malgunbd.ttf', 30)

# 게임 루프
clock = pygame.time.Clock()
running = True

while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    screen.fill((0, 0, 0))

    if game_state == "start":
        # 시작 화면
        screen.blit(background, (0, 0))
        title_text = font.render("달려라 짱구!", True, (0, 0, 255))
        instruction_text = font.render("방향키(←↑↓→)로 꽃덤불을 향해 가세요!", True, (255, 105, 180))
        start_text = font.render("시작하려면 스페이스 바를 누르세요", True, (255, 255, 255))

        screen.blit(title_text, (screen_width // 2 - title_text.get_width() // 2, 100))
        screen.blit(instruction_text, (screen_width // 2 - instruction_text.get_width() // 2, 150))
        screen.blit(start_text, (screen_width // 2 - start_text.get_width() // 2, 400))

        keys = pygame.key.get_pressed()
        if keys[pygame.K_SPACE]:
            game_state = "playing"

    elif game_state == "playing":
        keys = pygame.key.get_pressed()
        if not game_over:
            if keys[pygame.K_LEFT]:
                player_x -= 2
            if keys[pygame.K_RIGHT]:
                player_x += 2
            if keys[pygame.K_UP]:
                player_y -= 2
            if keys[pygame.K_DOWN]:
                player_y += 2

            # 충돌 체크
            player_rect = pygame.Rect(player_x, player_y, 90, 90)
            for bush in bushes:
                if not bush["found"]:
                    bush_rect = pygame.Rect(bush["x"], bush["y"], 100, 100)
                    if player_rect.colliderect(bush_rect):
                        bush["found"] = True
                        if bush["is_flower"]:
                            background_to_use = background_after
                            for _ in range(30):
                                size = random.randint(20, 50)
                                heart_surface = create_heart_surface(size)
                                hearts.append({
                                    'surf': heart_surface,
                                    'x': random.randint(bush["x"] - 50, bush["x"] + 50),
                                    'y': bush["y"],
                                    'speed': random.uniform(1, 3),
                                    'swing': random.uniform(-1, 1)
                                })
                            message = "감사합니다 사랑합니다 건강하세요!"
                            game_over = True
                            game_state = "game_over"
                        else:
                            message = "꽝! 아무것도 없어요."
                            bushes.remove(bush)

        screen.blit(background_to_use, (0, 0))
        for bush in bushes:
            if not bush["found"]:
                screen.blit(bush_img, (bush["x"], bush["y"]))
        if not game_over:
            screen.blit(player, (player_x, player_y))

        for h in hearts:
            h['y'] += h['speed']
            h['x'] += h['swing']
            screen.blit(h['surf'], (h['x'], h['y']))

        if message:
            text = font.render(message, True, (255, 0, 0))
            text_rect = text.get_rect(center=(screen_width // 2, 100))
            screen.blit(text, text_rect)

    elif game_state == "game_over":
        # 게임 오버 화면
        screen.blit(background_to_use, (0, 0))
        for h in hearts:
            h['y'] += h['speed']
            h['x'] += h['swing']
            screen.blit(h['surf'], (h['x'], h['y']))
        if message:
            text = font.render(message, True, (255, 0, 0))
            text_rect = text.get_rect(center=(screen_width // 2, 300))
            screen.blit(text, text_rect)

        # "나가기" 안내
        small_font = pygame.font.Font('malgunbd.ttf', 20)
        exit_text = small_font.render("나가기(스페이스 바)", True, (255, 255, 255))
        exit_text_rect = exit_text.get_rect(bottomright=(screen_width - 10, screen_height - 10))
        screen.blit(exit_text, exit_text_rect)

        keys = pygame.key.get_pressed()
        if keys[pygame.K_SPACE]:
            running = False

    pygame.display.update()
    clock.tick(60)

pygame.quit()
sys.exit()
