# Điều này giúp SQLAlchemy nhận diện tất cả các models khi tạo bảng
from .user import User
from .conversation import Conversation
from .participant import Participant
from .message import Message
from .message_receipt import MessageReceipt
from .friend import Friend